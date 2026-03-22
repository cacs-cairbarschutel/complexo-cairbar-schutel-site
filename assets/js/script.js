const BLOG_STORAGE_KEY = 'posts';

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

    const fileName = value
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
        createdAt: '2026-03-11T12:00:00.000Z'
    },
    {
        id: 2025112701,
        title: 'Voluntariado em Foco',
        description: 'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.',
        image: 'assets/img/WhatsApp Image 2025-11-27 at 19.04.09.jpg',
        content: 'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.\n\nO voluntariado é um dos pilares da nossa instituição, e sem a força dessas pessoas incríveis, não conseguiríamos realizar nem metade de nossos projetos.\n\nVocê já pensou em ser voluntário? Venha conhecer de perto as nossas instalações e se inspirar por aqueles que dedicam a vida por um mundo melhor.',
        author: 'Equipe CACS',
        status: 'published',
        createdAt: '2025-11-27T12:00:00.000Z'
    },
    {
        id: 2025112401,
        title: 'Saúde e Bem-estar no CDI',
        description: 'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.',
        image: 'assets/img/WhatsApp Image 2025-11-24 at 10.33.33 (3).jpg',
        content: 'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.\n\nAtividades recreativas, ginástica adaptada e oficinas de arte são algumas das práticas diárias que auxiliam no processo de convivência e qualidade de vida.\n\nAcreditamos que o envelhecimento deve ser vivido com alegria, autonomia e, acima de tudo, muita dignidade e amor.',
        author: 'Equipe CDI',
        status: 'published',
        createdAt: '2025-11-24T12:00:00.000Z'
    }
];

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function readStoredPosts() {
    try {
        const raw = localStorage.getItem(BLOG_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function writeStoredPosts(posts) {
    try {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
        return false;
    }

    return true;
}

function getPosts() {
    return readStoredPosts();
}

function savePosts(posts) {
    writeStoredPosts(posts);
}

function addPost(post) {
    const posts = getPosts();
    posts.push(post);
    savePosts(posts);
}

function deletePost(id) {
    const posts = getPosts().filter((post) => post.id !== Number(id));
    savePosts(posts);
}

function updatePost(updatedPost) {
    const posts = getPosts().map((post) => (post.id === Number(updatedPost.id) ? updatedPost : post));
    savePosts(posts);
}

function getPostById(id) {
    return getPosts().find((post) => post.id === Number(id));
}

function ensureSeedPosts() {
    try {
        if (localStorage.getItem(BLOG_STORAGE_KEY) === null) {
            savePosts(DEFAULT_POSTS);
        }
    } catch (error) {
        return;
    }
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

function getPublishedPosts(limit) {
    return getPosts()
        .filter((post) => post.status === 'published')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

function renderPostCards(container, posts) {
    if (!container) {
        return;
    }

    if (!posts.length) {
        container.innerHTML = '<p class="blog-empty">Ainda não há posts publicados.</p>';
        return;
    }

    const routePrefix = getBlogRoutePrefix();

    container.innerHTML = posts.map((post) => `
        <article class="blog-card">
            <a class="blog-card__media" href="${routePrefix}blog-post.html?id=${post.id}">
                <img src="${escapeHtml(normalizeImagePath(post.image))}" alt="${escapeHtml(post.title)}">
            </a>
            <div class="blog-card__body">
                <div class="blog-card__meta">
                    <span>${escapeHtml(formatDate(post.createdAt))}</span>
                    <span>${escapeHtml(post.author || 'Equipe CACS')}</span>
                </div>
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.description)}</p>
                <a class="blog-card__link" href="${routePrefix}blog-post.html?id=${post.id}">Ler artigo →</a>
            </div>
        </article>
    `).join('');
}

function renderHomeBlog() {
    const container = document.getElementById('posts');

    if (!container) {
        return;
    }

    renderPostCards(container, getPublishedPosts(3));
}

function renderBlogIndex() {
    const container = document.getElementById('blog-posts');

    if (!container) {
        return;
    }

    renderPostCards(container, getPublishedPosts(999));
}

function renderPostDetail() {
    const container = document.getElementById('post-detail');

    if (!container) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const post = getPostById(id);

    if (!post) {
        container.innerHTML = `
            <div class="blog-detail__empty">
                <h1>Post não encontrado</h1>
                <p>O artigo solicitado não está disponível no momento.</p>
                <a class="btn btn-secondary" href="blog.html">Voltar para o blog</a>
            </div>
        `;
        return;
    }

    const content = renderStoredContent(post.content);

    container.innerHTML = `
        <article class="blog-detail">
            <p class="blog-detail__eyebrow">${escapeHtml(formatDate(post.createdAt))} · ${escapeHtml(post.author || 'Equipe CACS')}</p>
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

    const renderList = () => {
        const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!posts.length) {
            list.innerHTML = '<p class="admin-empty">Nenhum post cadastrado ainda.</p>';
            return;
        }

        list.innerHTML = posts.map((post) => `
            <article class="admin-post-card">
                <div class="admin-post-card__header">
                    <div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p>${escapeHtml(post.author || 'Sem autor')} · ${escapeHtml(formatDate(post.createdAt))}</p>
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

    list.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');

        if (!actionButton) {
            return;
        }

        const id = Number(actionButton.dataset.id);
        const action = actionButton.dataset.action;

        if (action === 'edit') {
            const post = getPostById(id);

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

            deletePost(id);
            renderList();
            resetForm();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = fields.title.value.trim();
        const description = fields.description.value.trim();
        const author = fields.author.value.trim();
        const status = fields.status.value;
        syncContentField();
        const content = fields.content.value.trim();
        const currentPost = editingId !== null ? getPostById(editingId) : null;
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

            updatePost({
                ...currentPost,
                title,
                description,
                image,
                content,
                author,
                status
            });
        } else {
            addPost({
                id: Date.now(),
                title,
                description,
                image,
                content,
                author,
                status,
                createdAt: new Date().toISOString()
            });
        }

        renderList();
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
    }, { threshold: 0.3 });

    observer.observe(impactSection);
}

document.addEventListener('DOMContentLoaded', () => {
    ensureSeedPosts();
    setupSmoothAnchors();
    setupCarousel();
    setupImpactObserver();
    renderHomeBlog();
    renderBlogIndex();
    renderPostDetail();
    renderAdminBlog();
});

window.addEventListener('storage', (event) => {
    if (event.key !== BLOG_STORAGE_KEY) {
        return;
    }

    renderHomeBlog();
    renderBlogIndex();
    renderPostDetail();
});
