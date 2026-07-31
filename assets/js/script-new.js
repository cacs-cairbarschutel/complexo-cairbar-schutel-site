/**
 * Script principal integrado com a API do backend
 * Este arquivo gerencia a exibição e edição de posts com armazenamento no backend
 */

const BLOG_STORAGE_KEY = 'posts';
let API_INITIALIZED = false;
let USE_API = false;

// ============================================================================
// INICIALIZAÇÃO DA API
// ============================================================================

/**
 * Inicializar a API no carregamento da página
 */
async function initializeApiClient() {
    console.log('🚀 initializeApiClient() chamado');
    
    try {
        // Verificar se os scripts necessários estão carregados
        if (!window.apiConfig && !window.postsApi) {
            console.warn('⚠️ apiConfig e postsApi não carregados.');
            USE_API = false;
            return false;
        }

        console.log('✅ Sistema de API encontrado');

        if (window.apiConfig && !window.api) {
            console.log('🔄 Inicializando via apiConfig...');
            await window.apiConfig.initApiClient();
        }

        const client = window.apiConfig ? window.apiConfig.getApiClient() : window.postsApi;


        if (!client) {
            console.warn('⚠️ Cliente da API não pôde ser criado. initApiClient() retornou null.');
            USE_API = false;
            return false;
        }

        console.log('✅ Cliente da API criado com sucesso');

        // Marcar API como disponível — a própria busca de posts vai confirmar se funciona
        USE_API = true;
        API_INITIALIZED = true;
        console.log('✅ API configurada e pronta!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar API:', error.message);
        console.error('Stack:', error.stack);
        USE_API = false;
        return false;
    }
}

// ============================================================================
// FUNÇÕES DE ARMAZENAMENTO (API + LocalStorage Fallback)
// ============================================================================

function getPageAssetPrefix() {
    return window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') || window.location.pathname.includes('/financeiro/') ? '../' : '';
}

function normalizeImagePath(imagePath) {
    const value = String(imagePath || '').trim();

    if (!value) {
        return '';
    }

    if (/^(data:|https?:\/\/|\/\/)/i.test(value)) {
        return value;
    }

    // Se começar com /, remover a barra inicial para processamento
    let cleanPath = value.startsWith('/') ? value.substring(1) : value;

    const fileName = cleanPath
        .replace(/^Fotos\//, '')
        .replace(/^assets\/img\//, '');

    if (!fileName) {
        return value;
    }

    return `${getPageAssetPrefix()}assets/img/${fileName}`;
}

function getBlogRoutePrefix() {
    return window.location.pathname.includes('/pages/') ? '' : 'pages/';
}

const DEFAULT_POSTS = [
    {
        id: 2026031101,
        title: 'Ações que Transformam',
        description: 'Saiba como nossas campanhas de arrecadação estão impactando a comunidade local.',
        image: 'assets/img/WhatsApp Image 2026-02-06 at 12.23.17.jpg',
        content: 'Saiba como nossas campanhas de arrecadação estão impactando a comunidade local.\n\nCada doação, por menor que seja, tem o poder de transformar a realidade de famílias que se encontram em situação vulnerável.\n\nConvidamos você a continuar apoiando nossos projetos e acompanhar de perto as histórias de superação que nascem a partir do nosso trabalho.',
        author: 'Equipe CACS',
        status: 'published',
        created_at: '2026-03-11T12:00:00.000Z'
    },
    {
        id: 2025112701,
        title: 'Voluntariado em Foco',
        description: 'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.',
        image: 'assets/img/WhatsApp Image 2025-11-27 at 19.04.09.jpg',
        content: 'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.\n\nO voluntariado é um dos pilares da nossa instituição, e sem a força dessas pessoas incríveis, não conseguiríamos realizar nem metade de nossos projetos.\n\nVocê já pensou em ser voluntário? Venha conhecer de perto as nossas instalações e se inspirar por aqueles que dedicam a vida por um mundo melhor.',
        author: 'Equipe CACS',
        status: 'published',
        created_at: '2025-11-27T12:00:00.000Z'
    },
    {
        id: 2025112401,
        title: 'Saúde e Bem-estar no CDI',
        description: 'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.',
        image: 'assets/img/WhatsApp Image 2025-11-24 at 10.33.33 (3).jpg',
        content: 'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.\n\nAtividades recreativas, ginástica adaptada e oficinas de arte são algumas das práticas diárias que auxiliam no processo de convivência e qualidade de vida.\n\nAcreditamos que o envelhecimento deve ser vivido com alegria, autonomia e, acima de tudo, muita dignidade e amor.',
        author: 'Equipe CDI',
        status: 'published',
        created_at: '2025-11-24T12:00:00.000Z'
    }
];

/**
 * Ler posts do localStorage
 */
function readStoredPosts() {
    try {
        const raw = localStorage.getItem(BLOG_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Erro ao ler localStorage:', error);
        return [];
    }
}

/**
 * Escrever posts no localStorage
 */
function writeStoredPosts(posts) {
    try {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
        return true;
    } catch (error) {
        console.error('Erro ao escrever em localStorage:', error);
        return false;
    }
}

/**
 * Obter posts (apenas da API)
 */
async function getPosts() {
    console.log('📋 getPosts() chamado');
    console.log('USE_API:', USE_API);
    console.log('window.postsApi:', window.postsApi);
    
    if (USE_API && window.postsApi) {
        try {
            console.log('🔍 Buscando posts da API...');
            const posts = await window.postsApi.fetchAllPosts();
            
            if (posts && posts.length > 0) {
                console.log('✅ Posts encontrados no banco:', posts.length);
                return posts;
            }
            
            console.warn('⚠️ Banco de dados retornou 0 posts. Usando posts padrão.');
            return DEFAULT_POSTS;
        } catch (error) {
            console.error('❌ Erro ao buscar posts do banco:', error.message);
            return DEFAULT_POSTS;
        }
    }

    console.warn('⚠️ Sistema de API não disponível. Usando posts padrão.');
    return DEFAULT_POSTS;
}

/**
 * Salvar posts (apenas na API via operações específicas)
 * Nota: Esta função agora é um placeholder. Use createPost, updatePost, deletePost
 */
async function savePosts(posts) {
    // Operações de salvamento são feitas diretamente via createPost, updatePost, deletePost
    console.warn('Use as funções específicas: createPost(), updatePost(), deletePost()');
}

/**
 * Adicionar novo post (apenas API)
 */
async function addPost(post) {
    if (USE_API && window.postsApi) {
        try {
            const newPost = {
                ...post,
                created_at: post.created_at || post.createdAt || new Date().toISOString()
            };
            await window.postsApi.createPost(newPost);
        } catch (error) {
            console.error('Erro ao criar post na API:', error.message);
            throw error;
        }
    } else {
        console.error('API não disponível. Post não foi criado.');
    }
}

/**
 * Deletar um post (apenas API)
 */
async function deletePost(id) {
    if (USE_API && window.postsApi) {
        try {
            await window.postsApi.deletePost(String(id));
        } catch (error) {
            console.error('Erro ao deletar post da API:', error.message);
            throw error;
        }
    } else {
        console.error('API não disponível. Post não foi deletado.');
    }
}

/**
 * Atualizar um post existente (apenas API)
 */
async function updatePost(updatedPost) {
    if (USE_API && window.postsApi) {
        try {
            const postData = {
                ...updatedPost,
                created_at: updatedPost.created_at || updatedPost.createdAt,
                updated_at: new Date().toISOString()
            };
            await window.postsApi.updatePost(String(updatedPost.id), postData);
        } catch (error) {
            console.error('Erro ao atualizar post na API:', error.message);
            throw error;
        }
    } else {
        console.error('API não disponível. Post não foi atualizado.');
    }
}

/**
 * Obter post por ID
 */
async function getPostById(id) {
    console.log('🔍 getPostById chamado para ID:', id);
    
    if (USE_API && window.postsApi) {
        try {
            console.log('📡 Buscando post diretamente na API por ID...');
            const post = await window.postsApi.fetchPostById(String(id));
            if (post) {
                console.log('✅ Post encontrado via busca direta:', post.title);
                return post;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar post individual na API:', error.message);
        }
    }

    // Fallback para busca local (pode falhar com BIGINTs grandes devido a precisão do JS)
    console.log('⚠️ Tentando busca local como fallback...');
    const posts = await getPosts();
    const found = posts.find((post) => String(post.id) === String(id));
    
    if (!found) {
        console.warn('❌ Post não encontrado nem localmente. IDs disponíveis:', posts.map(p => String(p.id)));
    }
    
    return found;
}

/**
 * Garantir que os posts padrão estejam na API
 */
async function ensureSeedPosts() {
    try {
        // Na API não precisamos fazer seed automático via script-new.js
        // pois os dados já devem estar lá. Apenas log para debug.
        if (USE_API) {
            console.info('ℹ️ Verificando conexão para posts...');
        }
    } catch (error) {
        console.error('Erro ao verificar posts:', error);
    }
}

// ============================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================================================

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function sanitizeRichText(html) {
    if (!html) {
        return '';
    }

    const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'SPAN']);
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = documentFragment.body.firstElementChild;

    if (!root) {
        return '';
    }

    const sanitizeNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent || '');
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return document.createDocumentFragment();
        }

        const tagName = node.tagName.toUpperCase();

        if (!allowedTags.has(tagName)) {
            const fragment = document.createDocumentFragment();
            node.childNodes.forEach((child) => {
                fragment.appendChild(sanitizeNode(child));
            });
            return fragment;
        }

        const element = document.createElement(tagName.toLowerCase());

        if (tagName === 'A') {
            const href = node.getAttribute('href') || '#';
            element.setAttribute('href', href);
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
        }

        if (tagName === 'IMG') {
            const src = node.getAttribute('src') || '';
            if (!src) {
                return document.createDocumentFragment();
            }

            element.setAttribute('src', src);
            element.setAttribute('alt', node.getAttribute('alt') || 'Imagem do post');
        }

        node.childNodes.forEach((child) => {
            element.appendChild(sanitizeNode(child));
        });

        return element;
    };

    const wrapper = document.createElement('div');
    root.childNodes.forEach((child) => {
        wrapper.appendChild(sanitizeNode(child));
    });

    return wrapper.innerHTML;
}

function renderStoredContent(content) {
    const value = String(content || '').trim();

    if (!value) {
        return '';
    }

    const looksLikeHtml = /<\s*[a-z][\s\S]*>/i.test(value);

    if (looksLikeHtml) {
        return sanitizeRichText(value);
    }

    return value
        .split(/\n+/)
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
}

const POSTS_HOME_CACHE_KEY = 'cacs_home_posts_cache';
const POSTS_BLOG_CACHE_KEY = 'cacs_blog_posts_cache';

function getCachedHomePosts() {
    try {
        const raw = localStorage.getItem(POSTS_HOME_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setCachedHomePosts(posts) {
    try {
        localStorage.setItem(POSTS_HOME_CACHE_KEY, JSON.stringify(posts));
    } catch (e) {
        console.warn('Erro ao salvar cache de posts:', e);
    }
}

function getCachedBlogPosts() {
    try {
        const raw = localStorage.getItem(POSTS_BLOG_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setCachedBlogPosts(posts) {
    try {
        localStorage.setItem(POSTS_BLOG_CACHE_KEY, JSON.stringify(posts));
    } catch (e) {
        console.warn('Erro ao salvar cache do blog:', e);
    }
}

async function getPublishedPosts(limit) {
    console.log('📰 getPublishedPosts(' + limit + ') chamado');

    if (USE_API && window.postsApi && window.postsApi.fetchPublishedPosts) {
        try {
            const apiPosts = await window.postsApi.fetchPublishedPosts(limit);
            if (apiPosts && apiPosts.length > 0) {
                return apiPosts;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar posts publicados da API:', error.message);
        }
    }
    
    const posts = await getPosts();
    const list = (posts && posts.length > 0) ? posts : DEFAULT_POSTS;

    return list
        .filter(p => p.status === 'published' || !p.status)
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, limit);
}

function renderPostCards(container, posts) {
    console.log('🎨 renderPostCards() chamado com', posts?.length || 0, 'posts');
    
    if (!container) {
        console.error('❌ Container é null');
        return;
    }

    if (!posts.length) {
        console.warn('⚠️ Nenhum post para renderizar');
        container.innerHTML = '<p class="blog-empty">Ainda não há posts publicados.</p>';
        return;
    }

    const routePrefix = getBlogRoutePrefix();

    const html = posts.map((post, index) => {
        return `
        <article class="blog-card">
            <a class="blog-card__media" href="${routePrefix}blog-post.html?id=${post.id}">
                <img src="${escapeHtml(normalizeImagePath(post.image))}" alt="${escapeHtml(post.title)}">
            </a>
            <div class="blog-card__body">
                <div class="blog-card__meta">
                    <span>${escapeHtml(formatDate(post.created_at || post.createdAt))}</span>
                    <span>${escapeHtml(post.author || 'Equipe CACS')}</span>
                </div>
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.description)}</p>
                <a class="blog-card__link" href="${routePrefix}blog-post.html?id=${post.id}">Ler artigo →</a>
            </div>
        </article>
    `
    }).join('');
    
    container.innerHTML = html;
    console.log('✅ HTML renderizado com sucesso');
}

async function renderHomeBlog() {
    console.log('🏠 renderHomeBlog() chamado');
    
    const container = document.getElementById('posts');

    if (!container) {
        console.warn('⚠️ Container #posts não encontrado no DOM da homepage');
        return;
    }

    // 1. Carregar do cache local ou DEFAULT_POSTS imediatamente (0ms delay)
    let cachedPosts = getCachedHomePosts();
    if (!cachedPosts || cachedPosts.length === 0) {
        cachedPosts = DEFAULT_POSTS.slice(0, 3);
    }

    console.log('⚡ Renderizando posts da Home (0ms)...');
    renderPostCards(container, cachedPosts);

    // 2. Buscar da API em segundo plano se a API estiver disponível
    if (USE_API) {
        console.log('📋 Buscando últimos 3 posts atualizados da API...');
        const freshPosts = await getPublishedPosts(3);

        if (freshPosts && freshPosts.length > 0) {
            console.log('🖼️ Renderizando posts atualizados na homepage...');
            renderPostCards(container, freshPosts);
            setCachedHomePosts(freshPosts);
        }
    }
}

function renderSkeletonCards(container, count = 6) {
    const skeletonCard = `
        <article class="blog-card blog-card--skeleton">
            <div class="blog-card__media"></div>
            <div class="blog-card__body">
                <div class="skeleton-line skeleton-line--short"></div>
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line skeleton-line--full"></div>
                <div class="skeleton-line skeleton-line--full"></div>
                <div class="skeleton-line skeleton-line--short"></div>
            </div>
        </article>
    `;
    container.innerHTML = skeletonCard.repeat(count);
}

async function renderBlogIndex() {
    console.log('🎨 renderBlogIndex() chamado');
    
    const container = document.getElementById('blog-posts');

    if (!container) {
        console.warn('⚠️ Container #blog-posts não encontrado no DOM');
        return;
    }

    // 1. Mostrar cache imediatamente se existir
    const cached = getCachedBlogPosts();
    if (cached && cached.length > 0) {
        console.log('⚡ Renderizando', cached.length, 'posts do cache...');
        renderPostCards(container, cached);
    }

    // 2. Buscar os 6 primeiros posts rapidamente
    console.log('📋 Buscando primeiros 6 posts...');
    const firstPosts = await getPublishedPosts(6);
    console.log('🖼️  Renderizando primeiros', firstPosts.length, 'posts...');
    renderPostCards(container, firstPosts);

    // 3. Buscar o restante em background sem bloquear
    if (USE_API) {
        getPublishedPosts(999).then(allPosts => {
            if (allPosts.length > 6) {
                console.log('🖼️  Renderizando todos os', allPosts.length, 'posts...');
                renderPostCards(container, allPosts);
                setCachedBlogPosts(allPosts);
            }
        }).catch(e => console.warn('⚠️ Erro ao carregar posts adicionais:', e));
    }
}

async function renderPostDetail() {
    console.log('📖 renderPostDetail() chamado');
    const container = document.getElementById('post-detail');

    if (!container) {
        console.log('⏭️  Container #post-detail não encontrado, pulando...');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    console.log('🆔 ID do post na URL:', id);
    
    if (!id) {
        console.warn('⚠️ Nenhum ID de post fornecido na URL');
        return;
    }

    const post = await getPostById(id);

    if (!post) {
        console.error('❌ Post não encontrado para o ID:', id);
        container.innerHTML = `
            <div class="blog-detail__empty">
                <h1>Post não encontrado</h1>
                <p>O artigo solicitado não está disponível no momento.</p>
                <div style="margin-top: 20px;">
                    <a class="btn btn-secondary" href="blog.html">Voltar para o blog</a>
                </div>
            </div>
        `;
        return;
    }

    console.log('✨ Renderizando detalhes do post:', post.title);
    const content = renderStoredContent(post.content);

    container.innerHTML = `
        <article class="blog-detail">
            <p class="blog-detail__eyebrow">${escapeHtml(formatDate(post.created_at || post.createdAt))} · ${escapeHtml(post.author || 'Equipe CACS')}</p>
            <h1>${escapeHtml(post.title)}</h1>
            <p class="blog-detail__description">${escapeHtml(post.description)}</p>
            <img class="blog-detail__image" src="${escapeHtml(normalizeImagePath(post.image))}" alt="${escapeHtml(post.title)}">
            <div class="blog-detail__content">
                ${content}
            </div>
            <div class="blog-detail__actions">
                <a class="btn btn-secondary" href="blog.html">← Voltar para o blog</a>
            </div>
        </article>
    `;
}

function renderAdminBlog() {
    const form = document.getElementById('blog-form');
    const list = document.getElementById('posts-list');

    if (!form || !list) {
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const cancelButton = document.getElementById('cancel-edit');
    let editingId = null;
    const editor = form.querySelector('#content-editor');
    const imageFileInput = form.querySelector('[name="imageFile"]');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewImg = document.getElementById('image-preview-img');
    const imagePreviewEmpty = imagePreview ? imagePreview.querySelector('.image-preview__empty') : null;
    const contentImageInput = document.createElement('input');
    let selectedImageData = '';

    contentImageInput.type = 'file';
    contentImageInput.accept = 'image/*';
    contentImageInput.hidden = true;
    form.appendChild(contentImageInput);

    const fields = {
        title: form.querySelector('[name="title"]'),
        description: form.querySelector('[name="description"]'),
        content: form.querySelector('[name="content"]'),
        author: form.querySelector('[name="author"]'),
        status: form.querySelector('[name="status"]')
    };

    const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
        reader.readAsDataURL(file);
    });

    const updateCoverPreview = (imageData, label) => {
        if (!imagePreview || !imagePreviewImg || !imagePreviewEmpty) {
            return;
        }

        if (imageData) {
            imagePreviewImg.src = imageData;
            imagePreviewImg.alt = label || 'Pré-visualização da imagem do post';
            imagePreviewImg.hidden = false;
            imagePreviewEmpty.hidden = true;
            return;
        }

        imagePreviewImg.removeAttribute('src');
        imagePreviewImg.hidden = true;
        imagePreviewEmpty.hidden = false;
    };

    const clearCoverSelection = () => {
        selectedImageData = '';

        if (imageFileInput) {
            imageFileInput.value = '';
        }

        updateCoverPreview('', '');
    };

    const handleCoverImageSelection = async (file) => {
        if (!file) {
            return;
        }

        const dataUrl = await readFileAsDataUrl(file);
        selectedImageData = dataUrl;
        updateCoverPreview(dataUrl, file.name);
    };

    const insertContentImage = async (file) => {
        if (!editor || !file) {
            return;
        }

        const dataUrl = await readFileAsDataUrl(file);
        editor.focus();
        document.execCommand('insertImage', false, dataUrl);

        const insertedImage = editor.querySelector(`img[src="${dataUrl}"]`);

        if (insertedImage) {
            insertedImage.setAttribute('alt', file.name || 'Imagem inserida no conteúdo');
        }

        syncContentField();
        focusEditor();
    };

    const syncContentField = () => {
        if (!editor || !fields.content) {
            return;
        }

        fields.content.value = editor.innerHTML.trim();
    };

    const setEditorContent = (html) => {
        if (!editor || !fields.content) {
            return;
        }

        editor.innerHTML = html || '';
        syncContentField();
    };

    const focusEditor = () => {
        if (!editor) {
            return;
        }

        editor.focus();
    };

    const applyEditorCommand = (format, value) => {
        if (!editor) {
            return;
        }

        editor.focus();

        if (format === 'formatBlock' && value) {
            document.execCommand(format, false, value);
        } else if (format === 'createLink') {
            const linkUrl = window.prompt('Digite a URL do link:');

            if (!linkUrl) {
                return;
            }

            document.execCommand('createLink', false, linkUrl);
        } else if (format === 'insertImage') {
            contentImageInput.value = '';
            contentImageInput.click();
            return;
        } else {
            document.execCommand(format, false, value);
        }

        syncContentField();
        focusEditor();
    };

    if (imageFileInput) {
        imageFileInput.addEventListener('change', async () => {
            const file = imageFileInput.files && imageFileInput.files[0];

            try {
                await handleCoverImageSelection(file);
            } catch (error) {
                window.alert(error.message);
                clearCoverSelection();
            }
        });
    }

    contentImageInput.addEventListener('change', async () => {
        const file = contentImageInput.files && contentImageInput.files[0];

        try {
            await insertContentImage(file);
        } catch (error) {
            window.alert(error.message);
        }
    });

    if (editor) {
        editor.addEventListener('input', syncContentField);
        editor.addEventListener('blur', syncContentField);
        editor.addEventListener('paste', () => {
            window.setTimeout(syncContentField, 0);
        });
    }

    form.querySelectorAll('[data-format]').forEach((button) => {
        button.addEventListener('click', () => {
            applyEditorCommand(button.dataset.format, button.dataset.value || undefined);
        });
    });

    const resetForm = () => {
        form.reset();
        editingId = null;

        setEditorContent('');
        clearCoverSelection();

        if (submitButton) {
            submitButton.textContent = 'Publicar post';
        }

        if (cancelButton) {
            cancelButton.hidden = true;
        }
    };

    const fillForm = (post) => {
        editingId = post.id;

        fields.title.value = post.title || '';
        fields.description.value = post.description || '';
        fields.author.value = post.author || '';
        fields.status.value = post.status || 'draft';
        setEditorContent(post.content || '');
        selectedImageData = normalizeImagePath(post.image || '');
        updateCoverPreview(selectedImageData, post.title || 'Pré-visualização da imagem do post');

        if (imageFileInput) {
            imageFileInput.value = '';
        }

        if (submitButton) {
            submitButton.textContent = 'Atualizar post';
        }

        if (cancelButton) {
            cancelButton.hidden = false;
        }

        fields.title.focus();
    };

    const renderList = async () => {
        const posts = (await getPosts()).sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

        if (!posts.length) {
            list.innerHTML = '<p class="admin-empty">Nenhum post cadastrado ainda.</p>';
            return;
        }

        list.innerHTML = posts.map((post) => `
            <article class="admin-post-card">
                <div class="admin-post-card__header">
                    <div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p>${escapeHtml(post.author || 'Sem autor')} · ${escapeHtml(formatDate(post.created_at || post.createdAt))}</p>
                    </div>
                    <span class="status-badge status-${escapeHtml(post.status)}">${escapeHtml(post.status)}</span>
                </div>
                <p class="admin-post-card__description">${escapeHtml(post.description)}</p>
                <div class="admin-post-card__actions">
                    <button type="button" class="btn btn-secondary btn-small" data-action="edit" data-id="${post.id}">Editar</button>
                    <button type="button" class="btn btn-danger btn-small" data-action="delete" data-id="${post.id}">Excluir</button>
                </div>
            </article>
        `).join('');
    };

    list.addEventListener('click', async (event) => {
        const actionButton = event.target.closest('[data-action]');

        if (!actionButton) {
            return;
        }

        const id = actionButton.dataset.id;
        const action = actionButton.dataset.action;

        if (action === 'edit') {
            const post = await getPostById(id);

            if (post) {
                fillForm(post);
            }

            return;
        }

        if (action === 'delete') {
            const confirmed = window.confirm('Tem certeza que deseja excluir este post?');

            if (!confirmed) {
                return;
            }

            await deletePost(id);
            await renderList();
            resetForm();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = fields.title.value.trim();
        const description = fields.description.value.trim();
        const author = fields.author.value.trim();
        const status = fields.status.value;
        syncContentField();
        const content = fields.content.value.trim();
        const currentPost = editingId !== null ? await getPostById(editingId) : null;
        const image = selectedImageData || (currentPost ? currentPost.image : '');

        if (!title || !description || !image || !content || !author) {
            if (!selectedImageData && !currentPost) {
                window.alert('Selecione uma imagem do computador para continuar.');
            }

            return;
        }

        if (editingId !== null) {
            if (!currentPost) {
                resetForm();
                return;
            }

            await updatePost({
                ...currentPost,
                title,
                description,
                image,
                content,
                author,
                status
            });
        } else {
            await addPost({
                id: Date.now(),
                title,
                description,
                image,
                content,
                author,
                status,
                created_at: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }

        await renderList();
        resetForm();
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            resetForm();
        });
    }

    renderList();
}

function setupSmoothAnchors() {
    const links = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('.site-header');

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') {
                event.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);

            if (!targetSection) {
                return;
            }

            event.preventDefault();

            const headerOffset = header ? header.offsetHeight : 0;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            const startPosition = window.pageYOffset;
            const distance = offsetPosition - startPosition;
            const duration = 1000;
            let start = null;

            window.requestAnimationFrame(step);

            function step(timestamp) {
                if (!start) {
                    start = timestamp;
                }

                const progress = timestamp - start;
                const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
                const percentage = Math.min(progress / duration, 1);
                const newPosition = startPosition + (distance * ease(percentage));

                window.scrollTo(0, newPosition);

                if (progress < duration) {
                    window.requestAnimationFrame(step);
                }
            }
        });
    });
}

function setupCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    const slideInterval = 2000;

    if (!slides.length) {
        return;
    }

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, slideInterval);
}

function setupImpactObserver() {
    const impactSection = document.querySelector('#impacto');

    if (!impactSection) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                impactSection.classList.add('visible');         
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    observer.observe(impactSection);
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOMContentLoaded disparado');

    setupSmoothAnchors();
    setupCarousel();
    setupImpactObserver();

    // Mostrar skeletons apenas se não houver cache (primeira visita)
    const blogContainer = document.getElementById('blog-posts');
    if (blogContainer && !getCachedBlogPosts()) {
        renderSkeletonCards(blogContainer, 6);
    }

    // Inicializar cliente da API (sem health-check, instantâneo)
    try { await initializeApiClient(); } catch(e) { console.error('❌ initializeApiClient falhou:', e); }

    // Renderizar todas as seções
    try { await renderHomeBlog(); } catch(e) { console.error('❌ renderHomeBlog falhou:', e); }
    try { await renderBlogIndex(); } catch(e) { console.error('❌ renderBlogIndex falhou:', e); }
    try { await renderPostDetail(); } catch(e) { console.error('❌ renderPostDetail falhou:', e); }
    try { renderAdminBlog(); } catch(e) { console.error('❌ renderAdminBlog falhou:', e); }

    console.log('✅ Página carregada e renderizada');

    window.addEventListener('storage', async (event) => {
        if (event.key !== BLOG_STORAGE_KEY) return;
        await renderHomeBlog();
        await renderBlogIndex();
        await renderPostDetail();
    });
});
