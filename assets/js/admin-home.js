const HOME_ADMIN_SECTIONS = ['hero', 'sobre', 'acolhimento', 'cdi', 'bilingue', 'florescer', 'brecho', 'cedesp', 'campanha-fome', 'eventos', 'faca-parte'];
const HOME_AUTOSAVE_DELAY = 900;

const HOME_ADMIN_DEFAULTS = {
    hero: {
        title: '63 anos de um trabalho de amor!',
        description: 'O CACS | Complexo Assistencial Cairbar Schutel, associação filantrópica sem fins lucrativos, foi criado em 17 de janeiro de 1963 movido pela busca de uma sociedade mais justa e com mais oportunidades.',
        image_url: 'assets/img/hero-bg.jpg'
    },
    sobre: {
        title: 'CACS',
        description: 'O CACS | Complexo Assistencial Cairbar Schutel, associação filantrópica sem fins lucrativos, fundado em 17 de janeiro de 1963, movido pela busca de uma sociedade mais justa e com mais oportunidades, trabalhando para resgatar a dignidade e fomentar a autonomia de pessoas em situação de vulnerabilidade.',
        image_url: 'assets/img/Home-CACS.jpeg'
    },
    acolhimento: {
        title: 'Programa de Acolhimento',
        description: 'O Acolhimento Psicológico oferece atendimento gratuito para pessoas em situação de vulnerabilidade social em São Paulo, com psicólogos voluntários qualificados.',
        image_url: 'assets/img/7. Acolhimento Psicológico.png'
    },
    cdi: {
        title: 'CDI - Centro Dia para Idosos',
        description: 'O Centro Dia para Idosos Dr. Ricardo oferece proteção social integral, estimulação cognitiva e convivência para idosos em vulnerabilidade social em São Paulo, promovendo envelhecimento ativo, autonomia e dignidade através de acompanhamento multidisciplinar.',
        image_url: 'assets/img/8. CDI.png'
    },
    bilingue: {
        title: 'CACS Bilíngue',
        description: 'O CACS Bilíngue oferece aulas gratuitas de inglês para crianças e adolescentes em situação de vulnerabilidade social em São Paulo, ampliando horizontes, desenvolvendo talentos e criando oportunidades de futuro através de educação de qualidade.',
        image_url: 'assets/img/IMG-20251122-WA0023.jpg'
    },
    florescer: {
        title: 'CACS Florescer',
        description: 'O CACS Florescer oferece capacitação em costura criativa e upcycling para mulheres em situação de vulnerabilidade social em São Paulo, promovendo autonomia financeira, desenvolvimento de habilidades e transformação através da economia circular.',
        image_url: 'assets/img/9. CACS Florescer.png'
    },
    brecho: {
        title: 'Brechó Solidário',
        description: 'Nosso brechó é uma das principais fontes de recursos para a manutenção dos nossos projetos sociais. Aqui você encontra roupas, calçados e acessórios de qualidade por preços muito acessíveis. Toda a renda é revertida para as famílias que apoiamos. Venha nos visitar, faça suas compras de forma sustentável e ainda nos ajude a transformar vidas!',
        image_url: 'assets/img/Imagem do WhatsApp de 2024-11-14 à(s) 15.50.28_09ae5eb0.jpg'
    },
    cedesp: {
        title: 'CEDESP',
        description: 'O CEDESP será um centro de capacitação profissional dedicado ao desenvolvimento social e produtivo de adolescentes e jovens a partir de 15 anos em situação de vulnerabilidade em São Paulo, com previsão de implantação em 2027.',
        image_url: 'assets/img/predioazul1.png'
    },
    'campanha-fome': {
        title: 'Campanha Contra a Fome',
        description: 'A Campanha Contra a Fome oferece segurança alimentar integral para famílias em situação de vulnerabilidade social em São Paulo, distribuindo alimentos essenciais e promovendo dignidade através do acesso ao direito fundamental de se alimentar.',
        image_url: 'assets/img/Cópia de 14. Campanha contra a Fome (2).jpg'
    },
    eventos: {
        title: 'Eventos no CACS',
        description: 'Nossos eventos são momentos de muita alegria, união e solidariedade. Desde os tradicionais almoços beneficentes até o famoso Pechinhão, cada encontro fortalece nossos laços com a comunidade e nos permite gerar renda para financiar os nossos projetos.',
        image_url: ''
    },
    'faca-parte': {
        title: 'Faça parte dessa causa',
        description: 'Junte-se a nós e ajude a transformar vidas por meio do voluntariado, das doações e do apoio aos nossos projetos sociais.',
        image_url: ''
    }
};

const selectedHomeImages = {
    hero: null,
    sobre: null,
    acolhimento: null,
    cdi: null,
    bilingue: null,
    florescer: null,
    brecho: null,
    cedesp: null,
    'campanha-fome': null,
    eventos: null,
    'faca-parte': null
};

const currentHomeContent = {
    hero: null,
    sobre: null,
    acolhimento: null,
    cdi: null,
    bilingue: null,
    florescer: null,
    brecho: null,
    cedesp: null,
    'campanha-fome': null,
    eventos: null,
    'faca-parte': null
};

const HOME_SYNC_CHANNEL = 'home-content-sync';
const HOME_CACHE_KEY = 'home-content-cache';
const homeAutosaveTimers = new Map();
let pendingManualSave = false;

function getHomeAdminClient() {
    return window.supabaseConfig?.getSupabaseClient?.() || null;
}

async function ensureHomeAdminClient() {
    if (!window.supabaseConfig?.initSupabaseClient) {
        return null;
    }

    await window.supabaseConfig.initSupabaseClient();
    return getHomeAdminClient();
}

function getHomeImagePrefix() {
    return `${window.location.origin}/`;
}

function normalizeHomePreviewUrl(imageUrl) {
    const value = String(imageUrl || '').trim();

    if (!value) {
        return '';
    }

    if (/^(data:|https?:\/\/|\/\/)/i.test(value)) {
        return value;
    }

    return new URL(value.replace(/^\.\//, '').replace(/^\//, ''), getHomeImagePrefix()).href;
}

function getSectionFields(section) {
    return {
        title: document.getElementById(`${section}-title`),
        description: document.getElementById(`${section}-description`),
        image: document.getElementById(`${section}-image`),
        currentTitle: document.getElementById(`${section}-current-title`),
        currentDescription: document.getElementById(`${section}-current-description`),
        currentImagePreview: document.getElementById(`${section}-current-image-preview`),
        currentImageText: document.getElementById(`${section}-current-image`),
        previewTitle: document.getElementById(`${section}-preview-title`),
        previewDescription: document.getElementById(`${section}-preview-description`),
        preview: document.getElementById(`${section}-preview`),
        previewImageText: document.getElementById(`${section}-preview-image-text`),
        currentImage: document.getElementById(`${section}-current-image`),
        uploadLabel: document.getElementById(`${section}-upload-label`)
    };
}

function getSectionContainer(section) {
    return document.querySelector(`[data-section-card="${section}"]`);
}

function setImageState(imageElement, textElement, imageUrl, fallbackText = 'Nenhuma imagem definida') {
    if (!imageElement || !textElement) {
        return;
    }

    const normalizedUrl = normalizeHomePreviewUrl(imageUrl);

    if (normalizedUrl) {
        imageElement.src = normalizedUrl;
        imageElement.hidden = false;
        textElement.textContent = imageUrl;
        return;
    }

    imageElement.hidden = true;
    textElement.textContent = fallbackText;
}

function renderCurrentState(section, content) {
    const fields = getSectionFields(section);
    if (!fields.preview && !fields.currentImagePreview) {
        return;
    }

    if (fields.currentTitle) {
        fields.currentTitle.textContent = content.title || HOME_ADMIN_DEFAULTS[section].title;
    }

    if (fields.currentDescription) {
        fields.currentDescription.textContent = content.description || HOME_ADMIN_DEFAULTS[section].description;
    }

    setImageState(fields.currentImagePreview, fields.currentImageText, content.image_url || HOME_ADMIN_DEFAULTS[section].image_url);

    if (fields.uploadLabel) {
        fields.uploadLabel.textContent = content.image_url ? 'Imagem atual carregada' : 'Enviar imagem';
    }
}

function setSectionCollapsed(section, collapsed) {
    const container = getSectionContainer(section);
    const button = document.querySelector(`[data-toggle-section="${section}"]`);
    const body = container?.querySelector('.home-section-card__body');

    if (!body || !button) {
        return;
    }

    body.hidden = collapsed;
    button.textContent = collapsed ? 'Expandir' : 'Recolher';
}

function notifyHomeContentChanged(payloadData = {}) {
    const payload = {
        type: 'home-content-updated',
        timestamp: Date.now(),
        sections: payloadData.sections || {}
    };

    try {
        localStorage.setItem('home-content-updated', JSON.stringify(payload));
        localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(payload.sections || {}));
    } catch (error) {
        console.warn('Não foi possível atualizar localStorage para sincronização da home.', error);
    }

    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(HOME_SYNC_CHANNEL);
        channel.postMessage(payload);
        channel.close();
    }
}

function persistHomeDraft(section) {
    const fields = getSectionFields(section);
    const draft = {
        section,
        title: fields.title ? fields.title.value.trim() : HOME_ADMIN_DEFAULTS[section].title,
        description: fields.description ? fields.description.value.trim() : HOME_ADMIN_DEFAULTS[section].description,
        image_url: currentHomeContent[section]?.image_url || HOME_ADMIN_DEFAULTS[section].image_url
    };

    try {
        const existingCache = JSON.parse(localStorage.getItem(HOME_CACHE_KEY) || '{}');
        existingCache[section] = draft;
        localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(existingCache));
        localStorage.setItem('home-content-updated', JSON.stringify({
            type: 'home-content-updated',
            timestamp: Date.now(),
            sections: existingCache
        }));
    } catch (error) {
        console.warn('Não foi possível salvar rascunho local da home.', error);
    }
}

function getSaveModalElements() {
    return {
        modal: document.getElementById('home-save-modal'),
        title: document.getElementById('home-save-modal-title'),
        message: document.querySelector('#home-save-modal .home-save-modal__panel p'),
        closeButton: document.getElementById('home-save-modal-close')
    };
}

function setSaveModalContent(title, message, buttonLabel = 'Fechar') {
    const { title: titleElement, message: messageElement, closeButton } = getSaveModalElements();

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (messageElement) {
        messageElement.textContent = message;
    }

    if (closeButton) {
        closeButton.textContent = buttonLabel;
    }
}

function openSaveModal(title = 'Salvando alterações', message = 'Aguarde enquanto processamos a atualização.', buttonLabel = 'Fechar') {
    const { modal } = getSaveModalElements();
    if (!modal) {
        return;
    }

    setSaveModalContent(title, message, buttonLabel);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeSaveModal() {
    const { modal } = getSaveModalElements();
    if (!modal) {
        return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

async function runManualSave() {
    pendingManualSave = true;
    try {
        await salvarConteudo();
    } finally {
        pendingManualSave = false;
    }
}

function renderInitialSectionState(section) {
    const fallback = HOME_ADMIN_DEFAULTS[section];
    const fields = getSectionFields(section);

    if (fields.title) {
        fields.title.value = fallback.title;
    }

    if (fields.description) {
        fields.description.value = fallback.description;
    }

    currentHomeContent[section] = fallback;
    renderCurrentState(section, fallback);
    updateLivePreview(section);
    setSectionCollapsed(section, false);
}

function renderInitialHomeState() {
    HOME_ADMIN_SECTIONS.forEach((section) => {
        renderInitialSectionState(section);
    });
}

function updateLivePreview(section) {
    const fields = getSectionFields(section);

    if (fields.previewTitle && fields.title) {
        fields.previewTitle.textContent = fields.title.value.trim() || HOME_ADMIN_DEFAULTS[section].title;
    }

    if (fields.previewDescription && fields.description) {
        fields.previewDescription.textContent = fields.description.value.trim() || HOME_ADMIN_DEFAULTS[section].description;
    }

    const selectedFile = selectedHomeImages[section];
    if (selectedFile && fields.preview && fields.previewImageText) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setImageState(fields.preview, fields.previewImageText, event.target.result, 'Imagem selecionada');
        };
        reader.readAsDataURL(selectedFile);
        return;
    }

    const currentState = currentHomeContent[section] || HOME_ADMIN_DEFAULTS[section];
    const currentPreviewUrl = selectedHomeImages[section] ? null : currentState.image_url;
    setImageState(fields.preview, fields.previewImageText, selectedHomeImages[section] ? fields.preview?.src : currentPreviewUrl || HOME_ADMIN_DEFAULTS[section].image_url, 'Nenhuma imagem definida');
}

async function uploadImagem(file, section) {
    if (!file) {
        return '';
    }

    const client = await ensureHomeAdminClient();
    if (!client) {
        throw new Error('Cliente Supabase não inicializado');
    }

    const fileName = `${section}-${Date.now()}-${file.name}`.replace(/\s+/g, '-');
    const filePath = `${section}/${fileName}`;

    const { error: uploadError } = await client.storage
        .from('home-images')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) {
        throw new Error(`Erro ao enviar imagem: ${uploadError.message}`);
    }

    const { data } = client.storage
        .from('home-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

async function saveSectionDirect(client, section, title, description, imageUrl, file) {
    let finalImageUrl = imageUrl;

    if (file) {
        finalImageUrl = await uploadImagem(file, section);
    }

    const { data, error } = await client
        .from('home_content')
        .upsert(
            {
                section,
                title,
                description,
                image_url: finalImageUrl,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'section' }
        )
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

async function saveSectionViaFunction(section, title, description, imageUrl, file) {
    const formData = new FormData();
    formData.append('section', section);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image_url', imageUrl);

    if (file) {
        formData.append('image', file);
    }

    const response = await fetch(`${window.supabaseConfig.SUPABASE_URL}/functions/v1/home-content-admin`, {
        method: 'POST',
        body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || 'Falha ao salvar pela Edge Function');
    }

    return payload.data || {
        section,
        title,
        description,
        image_url: imageUrl,
    };
}

function getSectionDraft(section) {
    const fields = getSectionFields(section);

    return {
        title: fields.title ? fields.title.value.trim() : '',
        description: fields.description ? fields.description.value.trim() : '',
        imageUrl: currentHomeContent[section]?.image_url || HOME_ADMIN_DEFAULTS[section].image_url,
        file: selectedHomeImages[section] || null,
    };
}

async function saveSection(section) {
    const client = await ensureHomeAdminClient();
    if (!client) {
        return null;
    }

    const { title, description, imageUrl, file } = getSectionDraft(section);

    if (!title || !description) {
        throw new Error(`Preencha título e descrição da seção ${section}.`);
    }

    let savedRow = null;
    let directSaveError = null;

    try {
        savedRow = await saveSectionDirect(client, section, title, description, imageUrl, file);
    } catch (error) {
        directSaveError = error;
    }

    if (!savedRow) {
        try {
            savedRow = await saveSectionViaFunction(section, title, description, imageUrl, file);
        } catch (functionError) {
            const directMessage = directSaveError?.message ? `Direto: ${directSaveError.message}` : 'Direto: sem retorno';
            throw new Error(`Erro ao salvar ${section}. ${directMessage}. Function: ${functionError.message}`);
        }
    }

    currentHomeContent[section] = {
        section,
        title,
        description,
        image_url: savedRow?.image_url || imageUrl,
    };

    selectedHomeImages[section] = null;

    const fields = getSectionFields(section);
    if (fields.image) {
        fields.image.value = '';
    }

    return currentHomeContent[section];
}

function scheduleSectionAutosave(section) {
    const currentTimer = homeAutosaveTimers.get(section);
    if (currentTimer) {
        clearTimeout(currentTimer);
    }

    const timer = setTimeout(async () => {
        const statusBox = document.getElementById('home-status');

        try {
            if (statusBox) {
                statusBox.textContent = `Salvando automaticamente a seção ${section}...`;
                statusBox.className = 'status-message status-message--info';
            }

            const savedRow = await saveSection(section);

            if (savedRow) {
                renderCurrentState(section, savedRow);
                updateLivePreview(section);
                notifyHomeContentChanged({ sections: { ...currentHomeContent } });

                if (statusBox) {
                    statusBox.textContent = `Seção ${section} atualizada com sucesso.`;
                    statusBox.className = 'status-message status-message--success';
                }
            }
        } catch (error) {
            console.error(error);
            if (statusBox) {
                statusBox.textContent = error.message;
                statusBox.className = 'status-message status-message--error';
            }
        }
    }, HOME_AUTOSAVE_DELAY);

    homeAutosaveTimers.set(section, timer);
}

async function carregarConteudo() {
    const client = await ensureHomeAdminClient();
    if (!client) {
        return;
    }

    const { data, error } = await client
        .from('home_content')
        .select('*')
        .in('section', HOME_ADMIN_SECTIONS);

    if (error) {
        console.error('❌ Erro ao carregar conteúdo da home:', error.message);
        return;
    }

    const rows = data || [];

    HOME_ADMIN_SECTIONS.forEach((section) => {
        const row = rows.find((item) => item.section === section) || HOME_ADMIN_DEFAULTS[section];
        const fields = getSectionFields(section);
        currentHomeContent[section] = row;
        selectedHomeImages[section] = null;

        if (fields.title) {
            fields.title.value = row.title || HOME_ADMIN_DEFAULTS[section].title;
        }

        if (fields.description) {
            fields.description.value = row.description || HOME_ADMIN_DEFAULTS[section].description;
        }

        renderCurrentState(section, row);
        updateLivePreview(section);

        if (fields.image) {
            fields.image.value = '';
        }

        setSectionCollapsed(section, false);
    });
}

async function salvarConteudo() {
    const client = await ensureHomeAdminClient();
    if (!client) {
        return;
    }

    const saveButton = document.getElementById('save-home-content');
    const statusBox = document.getElementById('home-status');

    try {
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Salvando...';
        }

        if (statusBox) {
            statusBox.textContent = 'Salvando conteúdo da home...';
            statusBox.className = 'status-message status-message--info';
        }

        for (const section of HOME_ADMIN_SECTIONS) {
            const savedRow = await saveSection(section);

            if (savedRow) {
                renderCurrentState(section, savedRow);
                updateLivePreview(section);
            }
        }

        await carregarConteudo();

        if (statusBox) {
            statusBox.textContent = 'Conteúdo da home atualizado com sucesso.';
            statusBox.className = 'status-message status-message--success';
        }

        openSaveModal('Alteração salva', 'As alterações da página inicial foram salvas com sucesso.');

        notifyHomeContentChanged({ sections: { ...currentHomeContent } });
    } catch (error) {
        console.error(error);
        if (statusBox) {
            statusBox.textContent = error.message;
            statusBox.className = 'status-message status-message--error';
        }

        openSaveModal('Falha ao salvar', error.message, 'Fechar');
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'Salvar conteúdo';
        }
    }
}

function bindImageInputs() {
    HOME_ADMIN_SECTIONS.forEach((section) => {
        const fields = getSectionFields(section);
        if (!fields.image) {
            return;
        }

        fields.image.addEventListener('change', () => {
            const file = fields.image.files && fields.image.files[0];
            selectedHomeImages[section] = file || null;
            updateLivePreview(section);

            persistHomeDraft(section);

            if (file) {
                scheduleSectionAutosave(section);
            }

            if (!file) {
                updateLivePreview(section);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const fields = getSectionFields(section);
                setImageState(fields.preview, fields.previewImageText, event.target.result, 'Imagem selecionada');
            };
            reader.readAsDataURL(file);
        });

        if (fields.title) {
            fields.title.addEventListener('input', () => {
                updateLivePreview(section);
                persistHomeDraft(section);
                scheduleSectionAutosave(section);
            });
        }

        if (fields.description) {
            fields.description.addEventListener('input', () => {
                updateLivePreview(section);
                persistHomeDraft(section);
                scheduleSectionAutosave(section);
            });
        }

        const toggleButton = document.querySelector(`[data-toggle-section="${section}"]`);
        const container = getSectionContainer(section);

        if (toggleButton && container) {
            toggleButton.addEventListener('click', () => {
                const body = container.querySelector('.home-section-card__body');
                if (!body) {
                    return;
                }

                setSectionCollapsed(section, !body.hidden);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    renderInitialHomeState();
    bindImageInputs();

    const saveModalElements = getSaveModalElements();

    const form = document.getElementById('admin-home-form');
    const reloadButton = document.getElementById('reload-home-content');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            openSaveModal('Salvando alterações', 'Aguarde enquanto a página inicial é atualizada.', 'Fechar');
            runManualSave();
        });
    }

    if (saveModalElements.closeButton) {
        saveModalElements.closeButton.addEventListener('click', closeSaveModal);
    }

    if (saveModalElements.modal) {
        saveModalElements.modal.addEventListener('click', (event) => {
            if (event.target === saveModalElements.modal) {
                closeSaveModal();
            }
        });
    }

    if (reloadButton) {
        reloadButton.addEventListener('click', carregarConteudo);
    }

    const statusBox = document.getElementById('home-status');
    if (statusBox) {
        statusBox.textContent = 'Carregando conteúdo salvo...';
        statusBox.className = 'status-message status-message--info';
    }

    await carregarConteudo();
});