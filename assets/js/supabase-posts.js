/**
 * Funções para gerenciar Posts no Supabase
 * 
 * Este arquivo contém todas as operações CRUD para posts no banco de dados Supabase.
 */

/**
 * Buscar todos os posts publicados (ordenados por data)
 */
async function fetchPublishedPosts() {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return [];
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar posts:', error.message);
            return [];
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
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return [];
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar posts:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar posts (exceção):', error.message);
        return [];
    }
}

/**
 * Criar um novo post
 */
async function createPost(postData) {
    const client = window.supabaseConfig?.getSupabaseClient();
    if (!client) {
        console.error('❌ Cliente Supabase não inicializado');
        return null;
    }

    try {
        // Preparar dados
        const newPost = {
            title: postData.title || 'Sem Título',
            description: postData.description || '',
            content: postData.content || '',
            image: postData.image || '',
            author: postData.author || 'Equipe CACS',
            status: postData.status || 'draft',
            created_at: postData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('posts')
            .insert([newPost])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao criar post:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro ao criar post (exceção):', error.message);
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

export {
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
