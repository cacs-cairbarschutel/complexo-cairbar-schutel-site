/**
 * Funções para gerenciar posts no backend.
 */

async function fetchPublishedPosts() {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return [];
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar posts publicados:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro ao buscar posts publicados:', error.message);
        return [];
    }
}

async function fetchPostById(postId) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return null;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('Erro ao buscar post:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar post:', error.message);
        return null;
    }
}

async function fetchAllPosts() {
    const client = window.apiConfig?.getApiClient();

    if (!window.apiConfig) {
        console.error('window.apiConfig não existe');
        return [];
    }

    if (!client) {
        console.error('Cliente da API não inicializado:', window.apiConfig);
        return [];
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar posts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro ao buscar posts:', error.message);
        return [];
    }
}

function generatePostId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `${timestamp}${String(random).padStart(5, '0')}`;
}

async function createPost(postData) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return null;
    }

    try {
        const postId = generatePostId();
        const newPost = {
            id: postId,
            title: postData.title || 'Sem Título',
            description: postData.description || '',
            content: postData.content || '',
            image: postData.image || null,
            author: postData.author || 'Equipe CACS',
            status: postData.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('posts')
            .insert([newPost])
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar post:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao criar post:', error.message);
        return null;
    }
}

async function updatePost(postId, postData) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return null;
    }

    try {
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
            console.error('Erro ao atualizar post:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao atualizar post:', error.message);
        return null;
    }
}

async function deletePost(postId) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return false;
    }

    try {
        const { error } = await client
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Erro ao deletar post:', error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao deletar post:', error.message);
        return false;
    }
}

async function publishPost(postId) {
    return updatePost(postId, {
        status: 'published',
        published_at: new Date().toISOString()
    });
}

async function unpublishPost(postId) {
    return updatePost(postId, { status: 'draft' });
}

async function uploadPostImage(file, postId) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return null;
    }

    try {
        const timestamp = Date.now();
        const fileName = `${postId}/${timestamp}-${file.name}`;

        const { data, error } = await client.storage
            .from('posts-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Erro ao fazer upload de imagem:', error.message);
            return null;
        }

        const { data: urlData } = client.storage
            .from('posts-images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Erro ao fazer upload de imagem:', error.message);
        return null;
    }
}

async function deletePostImage(imageUrl) {
    const client = window.apiConfig?.getApiClient();
    if (!client) {
        console.error('Cliente da API não inicializado');
        return false;
    }

    try {
        const urlObj = new URL(imageUrl);
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments.slice(pathSegments.indexOf('posts-images') + 1).join('/');

        const { error } = await client.storage
            .from('posts-images')
            .remove([fileName]);

        if (error) {
            console.error('Erro ao deletar imagem:', error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao deletar imagem:', error.message);
        return false;
    }
}

window.postsApi = {
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

window.supabasePosts = window.postsApi;
