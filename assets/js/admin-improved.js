/**
 * Script Admin Melhorado - Editor com Quill e Cropper
 * Funcionalidades: Upload drag & drop, crop de imagens, editor WYSIWYG
 */

let cropper = null;
let selectedImageData = null;
let selectedImageFile = null;  // Adicionar: guardar o File object original
let editingPostId = null;
let quillEditor = null;
let form = null;
let imageInput = null;
let imagePreviewImg = null;
let previewContainer = null;

// ============================================================================
// UTILITÁRIOS (DEFINIR ANTES)
// ============================================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `notification notification--${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// ============================================================================
// AGUARDAR SUPABASE ESTAR PRONTO
// ============================================================================

async function waitForSupabase(maxAttempts = 50) {
    for (let i = 0; i < maxAttempts; i++) {
        if (window.supabasePosts && window.supabasePosts.fetchAllPosts) {
            console.log('✅ Supabase Posts carregado com sucesso');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error('❌ Timeout: Supabase Posts não carregou');
    return false;
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Guardar o arquivo original para fazer upload depois
    selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
        selectedImageData = e.target.result;

        // Mostrar modal de crop
        showCropperModal(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showCropperModal(imageSrc) {
    // Criar modal se não existir
    let modal = document.getElementById('cropper-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cropper-modal';
        modal.classList.add('cropper-modal');
        modal.innerHTML = `
            <div class="cropper-modal__overlay"></div>
            <div class="cropper-modal__content">
                <div class="cropper-modal__header">
                    <h3>Ajustar Imagem</h3>
                    <button type="button" class="cropper-modal__close" aria-label="Fechar">&times;</button>
                </div>
                <div class="cropper-modal__body">
                    <img id="cropper-image" src="" alt="Imagem para cortar">
                </div>
                <div class="cropper-modal__footer">
                    <button type="button" class="btn btn-secondary" id="cancel-crop">Cancelar</button>
                    <div class="cropper-modal__actions">
                        <button type="button" class="btn btn-secondary" id="rotate-left" title="Girar para esquerda">↻ Girar</button>
                        <button type="button" class="btn btn-secondary" id="zoom-in" title="Aumentar zoom">🔍+</button>
                        <button type="button" class="btn btn-secondary" id="zoom-out" title="Diminuir zoom">🔍−</button>
                    </div>
                    <button type="button" class="btn btn-primary" id="apply-crop">Aplicar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.cropper-modal__close').addEventListener('click', closeCropperModal);
        modal.querySelector('#cancel-crop').addEventListener('click', closeCropperModal);
        modal.querySelector('#apply-crop').addEventListener('click', applyCrop);
        modal.querySelector('#rotate-left').addEventListener('click', () => cropper.rotate(-45));
        modal.querySelector('#zoom-in').addEventListener('click', () => cropper.zoom(0.1));
        modal.querySelector('#zoom-out').addEventListener('click', () => cropper.zoom(-0.1));
        modal.querySelector('.cropper-modal__overlay').addEventListener('click', closeCropperModal);
    }

    const cropperImage = modal.querySelector('#cropper-image');
    cropperImage.src = imageSrc;

    // Destruir cropper anterior se existir
    if (cropper) {
        cropper.destroy();
    }

    // Inicializar novo cropper
    cropper = new Cropper(cropperImage, {
        aspectRatio: 16 / 9,
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: true,
        restore: true,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
        zoomable: true,
        wheelZoomRatio: 0.1
    });

    modal.style.display = 'flex';
}

function closeCropperModal() {
    const modal = document.getElementById('cropper-modal');
    if (modal) {
        // Remover completamente do DOM (não apenas hide)
        modal.remove();
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }
}

function applyCrop() {
    console.log('✂️  applyCrop() EXECUTADO');
    
    const canvas = cropper.getCroppedCanvas({
        maxWidth: 1200,
        maxHeight: 800,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    selectedImageData = canvas.toDataURL();
    console.log('📸 selectedImageData gerado! Tamanho:', (selectedImageData.length / 1024).toFixed(2), 'KB');
    console.log('📸 Primeiras 100 caracteres:', selectedImageData.substring(0, 100));

    // Mostrar preview
    imagePreviewImg.src = selectedImageData;
    imagePreviewImg.style.display = 'block';
    previewContainer.querySelector('.image-preview__empty').style.display = 'none';

    closeCropperModal();
}

// Drag & Drop setup
function setupDragAndDrop() {
    if (!previewContainer) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
        previewContainer.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach((eventName) => {
        previewContainer.addEventListener(eventName, () => previewContainer.classList.add('image-preview--drag-over'), false);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        previewContainer.addEventListener(eventName, () => previewContainer.classList.remove('image-preview--drag-over'), false);
    });

    previewContainer.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    imageInput.files = files;

    const event = new Event('change', { bubbles: true });
    imageInput.dispatchEvent(event);
}

// ============================================================================
// GERENCIAMENTO DE POSTS
// ============================================================================

async function handleSubmitForm(e) {
    e.preventDefault();

    // Verificar Supabase antes de fazer nada
    if (!window.supabasePosts || !window.supabasePosts.createPost || !window.supabasePosts.updatePost) {
        showNotification('❌ Aguarde o banco de dados carregar... Se o erro persistir, recarregue a página.', 'error');
        console.error('❌ supabasePosts não disponível:', window.supabasePosts);
        return;
    }

    const title = form.querySelector('[name="title"]').value.trim();
    const author = form.querySelector('[name="author"]').value.trim();
    const description = form.querySelector('[name="description"]').value.trim();
    const content = quillEditor.root.innerHTML || '';
    const status = form.querySelector('[name="status"]').value;

    console.log('📝 Form values:', { title, author, description, status });
    console.log('📷 selectedImageData:', selectedImageData ? 'SIM (tamanho: ' + (selectedImageData.length / 1024).toFixed(2) + ' KB)' : 'NÃO');

    if (!title || !author || !description || !content || content === '<p><br></p>' || content === '<br>') {
        showNotification('❌ Por favor, preencha todos os campos!', 'error');
        return;
    }

    try {
        // Preparar URL/dados da imagem
        let imageData = null;

        // Se tiver imagem, guardar como base64 direto no banco (mais simples que RLS)
        if (selectedImageData) {
            console.log('📷 Preparando imagem (base64 no banco)...');
            console.log('📊 Tamanho da imagem:', (selectedImageData.length / 1024).toFixed(2), 'KB');
            imageData = selectedImageData;  // Guardar base64 direto
            showNotification('⏳ Salvando imagem junto com o post...', 'info');
        } else {
            console.warn('⚠️ Nenhuma imagem selecionada');
            showNotification('⚠️ Nenhuma imagem selecionada. Post será salvo sem imagem.', 'warning');
        }

        const post = {
            // Não enviar ID para criação nova - deixar Supabase gerar
            ...(editingPostId && { id: editingPostId }),  // Só incluir ID se estiver editando
            title,
            author,
            description,
            content,
            image: imageData,  // Guardar base64 direto
            status,
            created_at: editingPostId ? new Date().toISOString() : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('💾 Enviando para Supabase...');
        console.log('Dados do post:', post);

        if (editingPostId) {
            console.log('🔄 Modo: ATUALIZAR post ID:', editingPostId);
            const result = await window.supabasePosts.updatePost(editingPostId, post);
            console.log('✅ updatePost retornou:', result);
            showNotification('✅ Post atualizado com sucesso!', 'success');
        } else {
            console.log('✍️ Modo: CRIAR novo post');
            const result = await window.supabasePosts.createPost(post);
            console.log('✅ createPost retornou:', result);
            
            if (result) {
                console.log('✅ Post criado! Novo ID:', result.id);
                showNotification('✅ Post criado com sucesso!', 'success');
            } else {
                console.error('❌ createPost retornou null/falso');
                showNotification('❌ Erro ao criar post (desconhecido)', 'error');
                return;
            }
        }

        // Limpar form
        resetForm();
        await loadPostsList();
    } catch (error) {
        console.error('❌ Erro ao salvar post:', error);
        showNotification(`❌ Erro: ${error.message || 'Erro desconhecido'}`, 'error');
    }
}

async function editPost(postId) {
    try {
        const post = await window.supabasePosts.fetchPostById(postId);

        if (!post) {
            showNotification('❌ Post não encontrado', 'error');
            return;
        }

        // Preencher form
        form.querySelector('[name="title"]').value = post.title;
        form.querySelector('[name="author"]').value = post.author;
        form.querySelector('[name="description"]').value = post.description;
        quillEditor.root.innerHTML = post.content;
        form.querySelector('[name="status"]').value = post.status;

        // Mostrar imagem
        if (post.image) {
            selectedImageData = post.image;
            imagePreviewImg.src = post.image;
            imagePreviewImg.style.display = 'block';
            previewContainer.querySelector('.image-preview__empty').style.display = 'none';
        }

        editingPostId = postId;
        form.querySelector('button[type="submit"]').textContent = 'Atualizar post';
        document.getElementById('cancel-edit').style.display = 'inline-block';

        // Scroll para o form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        showNotification(`❌ Erro ao carregar post: ${error.message}`, 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Tem certeza que deseja deletar este post?')) {
        return;
    }

    try {
        await window.supabasePosts.deletePost(postId);
        showNotification('✅ Post deletado com sucesso!', 'success');
        await loadPostsList();
    } catch (error) {
        showNotification(`❌ Erro ao deletar: ${error.message}`, 'error');
    }
}

function resetForm() {
    form.reset();
    quillEditor.setContents([]);
    selectedImageData = null;
    selectedImageFile = null;
    editingPostId = null;
    imagePreviewImg.src = '';
    imagePreviewImg.style.display = 'none';
    previewContainer.querySelector('.image-preview__empty').style.display = 'block';
    form.querySelector('button[type="submit"]').textContent = 'Publicar post';
    document.getElementById('cancel-edit').style.display = 'none';
}

// ============================================================================
// CARREGAR LISTA DE POSTS
// ============================================================================

async function loadPostsList() {
    console.log('📋 loadPostsList() chamado');
    
    const listContainer = document.getElementById('posts-list');
    if (!listContainer) {
        console.error('❌ Element #posts-list não encontrado no DOM');
        return;
    }

    try {
        // Verificar se Supabase Posts estão disponíveis
        if (!window.supabasePosts) {
            console.warn('⏳ window.supabasePosts ainda não disponível');
            listContainer.innerHTML = '<p class="posts-list__error">❌ Aguardando conexão com o banco de dados...</p>';
            return;
        }
        
        if (!window.supabasePosts.fetchAllPosts) {
            console.warn('⏳ window.supabasePosts.fetchAllPosts não disponível');
            listContainer.innerHTML = '<p class="posts-list__error">❌ Aguardando funções de banco de dados...</p>';
            return;
        }

        console.log('📡 Buscando posts do Supabase...');
        const posts = await window.supabasePosts.fetchAllPosts();
        
        console.log('✅ Posts recebidos:', posts?.length || 0);

        if (!posts || posts.length === 0) {
            console.log('ℹ️ Nenhum post encontrado no banco de dados');
            listContainer.innerHTML = '<p class="posts-list__empty">Nenhum post criado ainda.</p>';
            return;
        }

        listContainer.innerHTML = posts
            .map(
                (post) => `
            <div class="post-item" data-id="${post.id}">
                <div class="post-item__header">
                    <h4>${escapeHtml(post.title)}</h4>
                    <span class="post-item__status post-item__status--${post.status}">
                        ${post.status === 'published' ? '✓ Publicado' : '○ Rascunho'}
                    </span>
                </div>
                <p class="post-item__author">por ${escapeHtml(post.author)}</p>
                <p class="post-item__date">${formatDate(post.created_at)}</p>
                <div class="post-item__actions">
                    <button type="button" class="btn btn-small btn-secondary" onclick="editPost('${post.id}')">
                        Editar
                    </button>
                    <button type="button" class="btn btn-small btn-danger" onclick="deletePost('${post.id}')">
                        Deletar
                    </button>
                </div>
            </div>
        `
            )
            .join('');
    } catch (error) {
        console.error('❌ Erro ao carregar posts:', error);
        listContainer.innerHTML = `<p class="posts-list__error">❌ Erro ao carregar posts: ${error.message || 'Desconhecido'}</p>`;
    }
}

// ============================================================================
// INICIALIZAR TUDO NO DOMCONTENTLOADED
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOMContentLoaded disparado');
    
    // Capturar elementos do DOM
    form = document.getElementById('blog-form');
    imageInput = document.querySelector('[name="imageFile"]');
    imagePreviewImg = document.getElementById('image-preview-img');
    previewContainer = document.getElementById('image-preview');

    console.log('✅ Elementos do DOM capturados');

    // Inicializar Quill Editor (não depende do Supabase)
    quillEditor = new Quill('#content-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ]
        },
        placeholder: 'Escreva o conteúdo do post aqui...'
    });

    console.log('✅ Quill Editor inicializado');

    // Setup de event listeners
    if (form) {
        form.addEventListener('submit', handleSubmitForm);
    }

    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }

    const cancelButton = document.getElementById('cancel-edit');
    if (cancelButton) {
        cancelButton.addEventListener('click', resetForm);
    }

    // Setup drag & drop
    setupDragAndDrop();

    console.log('✅ Event listeners configurados');

    // Inicializar Supabase e carregar posts (NÃO bloqueia o resto)
    try {
        console.log('🚀 Iniciando Supabase...');
        await window.supabaseConfig.initSupabaseClient();
        
        console.log('⏳ Aguardando Supabase estar pronto...');
        const supabaseReady = await waitForSupabase();
        
        if (supabaseReady) {
            console.log('✅ Supabase pronto! Carregando posts...');
            await loadPostsList();
        } else {
            showNotification('❌ Erro: Banco de dados não respondeu. Recarregue a página.', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        showNotification('❌ Erro ao conectar com o banco de dados. Recarregue a página.', 'error');
    }
});
