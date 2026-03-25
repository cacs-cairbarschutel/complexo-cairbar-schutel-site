/**
 * Funções para gerenciar Posts no Supabase
 * 
 * Este arquivo contém todas as operações CRUD para posts no banco de dados Supabase.
 */

/**
 * Buscar todos os posts publicados (ordenados por data)
 */
async function fetchPublishedPosts() {
    console.log('🔍 fetchPublishedPosts() chamado');
    
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return [];
    }

    try {
        console.log('📡 Buscando posts com status=published...');
        
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar posts publicados:', error.message);
            console.error('Código:', error.code);
            return [];
        }

        console.log('✅ Posts publicados carregados:', data?.length || 0);
        if (data && data.length > 0) {
            console.log('Posts encontrados:', data.map(p => ({ id: p.id, title: p.title, status: p.status })));
        }
        
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar posts (exceção):', error.message);
        return [];
    }
}

/**
 * Buscar um post por ID
 */
async function fetchPostById(postId) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return null;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar post:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar post (exceção):', error.message);
        return null;
    }
}

/**
 * Buscar todos os posts (incluindo rascunhos) - Apenas para admin
 */
async function fetchAllPosts() {
    console.log('🔍 fetchAllPosts() chamado');
    
    const client = window.supabaseConfig?.getSupabaseClient();
    
    if (!window.supabaseConfig) {
        console.error('❌ window.supabaseConfig NÃO EXISTE');
        return [];
    }
    
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado. supabaseConfig:', window.supabaseConfig);
        return [];
    }

    try {
        console.log('📡 Conectando ao banco de dados...');
        
        const { data, error } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar posts do Supabase:', error);
            console.error('Código de erro:', error.code);
            console.error('Mensagem:', error.message);
            return [];
        }

        console.log('✅ Posts carregados com sucesso:', data?.length || 0, 'posts');
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar posts (exceção):', error.message);
        console.error('Stack:', error.stack);
        return [];
    }
}

/**
 * Gerar ID único (bigint)
 * Usa timestamp + random para garantir unicidade
 */
function generatePostId() {
    // Usar timestamp em ms (13 dígitos) + número aleatório (5 dígitos)
    // Exemplo: 1711355569456_12345 → um número muito grande e único
    const timestamp = Date.now(); // 13 dígitos
    const random = Math.floor(Math.random() * 100000); // 5 dígitos
    return parseInt(`${timestamp}${String(random).padStart(5, '0')}`);
}

/**
 * Criar um novo post
 */
async function createPost(postData) {
    console.log('✍️ createPost() chamado com:', postData);
    
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return null;
    }

    try {
        // Preparar dados - GERAR ID único (bigint)
        const postId = generatePostId();
        const newPost = {
            id: postId,  // ID numérico único
            title: postData.title || 'Sem Título',
            description: postData.description || '',
            content: postData.content || '',
            image: postData.image || null,
            author: postData.author || 'Equipe CACS',
            status: postData.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('💾 Salvando novo post no Supabase:', {
            id: newPost.id,
            title: newPost.title,
            author: newPost.author,
            status: newPost.status,
            hasImage: newPost.image ? 'sim' : 'não'
        });

        const { data, error } = await client
            .from('posts')
            .insert([newPost])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao criar post:', error);
            console.error('Código:', error.code);
            console.error('Mensagem:', error.message);
            console.error('Detalhes:', error.details);
            return null;
        }

        console.log('✅ Post criado com sucesso! ID:', data?.id);
        console.log('Dados retornados:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao criar post (exceção):', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

/**
 * Atualizar um post existente
 */
async function updatePost(postId, postData) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return null;
    }

    try {
        // Preparar dados (sempre atualizar updated_at)
        const updatedPost = {
            ...postData,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('posts')
            .update(updatedPost)
            .eq('id', postId)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao atualizar post:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro ao atualizar post (exceção):', error.message);
        return null;
    }
}

/**
 * Deletar um post
 */
async function deletePost(postId) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return false;
    }

    try {
        const { error } = await client
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('❌ Erro ao deletar post:', error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Erro ao deletar post (exceção):', error.message);
        return false;
    }
}

/**
 * Publicar um post (mudar status para 'published')
 */
async function publishPost(postId) {
    return updatePost(postId, { 
        status: 'published',
        published_at: new Date().toISOString()
    });
}

/**
 * Despu

blicar um post (mudar status para 'draft')
 */
async function unpublishPost(postId) {
    return updatePost(postId, { status: 'draft' });
}

/**
 * Fazer upload de imagem para Storage do Supabase
 */
async function uploadPostImage(file, postId) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return null;
    }

    try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const fileName = `${postId}/${timestamp}-${file.name}`;

        const { data, error } = await client.storage
            .from('posts-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Erro ao fazer upload de imagem:', error.message);
            return null;
        }

        // Obter URL pública da imagem
        const { data: urlData } = client.storage
            .from('posts-images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error('❌ Erro ao fazer upload (exceção):', error.message);
        return null;
    }
}

/**
 * Deletar imagem do Storage
 */
async function deletePostImage(imageUrl) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return false;
    }

    try {
        // Extrair caminho do arquivo da URL
        const urlObj = new URL(imageUrl);
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments.slice(pathSegments.indexOf('posts-images') + 1).join('/');

        const { error } = await client.storage
            .from('posts-images')
            .remove([fileName]);

        if (error) {
            console.error('❌ Erro ao deletar imagem:', error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Erro ao deletar imagem (exceção):', error.message);
        return false;
    }
}

// Exportar para uso global
window.supabasePosts = {
    fetchPublishedPosts,
    fetchPostById,
    fetchAllPosts,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    uploadPostImage,
    deletePostImage
};

console.log('✅ supabasePosts exportado para window');
