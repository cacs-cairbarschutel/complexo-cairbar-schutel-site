const HOME_CONTENT_SECTIONS = {
    hero: {
        section: 'hero',
        titleSelector: '.hero-section .hero-content h1',
        descriptionSelector: '.hero-section .hero-content p',
        imageSelector: '.hero-carousel .carousel-slide'
    },
    sobre: {
        section: 'sobre',
        titleSelector: '.about-section .text-wrapper h2',
        descriptionSelector: '.about-section .text-wrapper p',
        imageSelector: '.about-section .image-wrapper img'
    },
    acolhimento: {
        section: 'acolhimento',
        titleSelector: '.cdi-section#acolhimento .text-wrapper h2',
        descriptionSelector: '.cdi-section#acolhimento .text-wrapper p',
        imageSelector: '.cdi-section#acolhimento .image-wrapper img'
    },
    cdi: {
        section: 'cdi',
        titleSelector: '.cdi-section#cdi .text-wrapper h2',
        descriptionSelector: '.cdi-section#cdi .text-wrapper p',
        imageSelector: '.cdi-section#cdi .image-wrapper img'
    },
    bilingue: {
        section: 'bilingue',
        titleSelector: '.cdi-section#bilingue .text-wrapper h2',
        descriptionSelector: '.cdi-section#bilingue .text-wrapper p',
        imageSelector: '.cdi-section#bilingue .image-wrapper img'
    },
    florescer: {
        section: 'florescer',
        titleSelector: '.cdi-section#florescer .text-wrapper h2',
        descriptionSelector: '.cdi-section#florescer .text-wrapper p',
        imageSelector: '.cdi-section#florescer .image-wrapper img'
    },
    brecho: {
        section: 'brecho',
        titleSelector: '.brecho-section .text-wrapper h2',
        descriptionSelector: '.brecho-section .text-wrapper p',
        imageSelector: '.brecho-section .image-wrapper img'
    },
    cedesp: {
        section: 'cedesp',
        titleSelector: '.gallery-section#cedesp .text-item h3',
        descriptionSelector: '.gallery-section#cedesp .text-item p',
        imageSelector: '.gallery-section#cedesp .gallery-item img'
    },
    'campanha-fome': {
        section: 'campanha-fome',
        titleSelector: '.cdi-section#campanha-fome .text-wrapper h2',
        descriptionSelector: '.cdi-section#campanha-fome .text-wrapper p',
        imageSelector: '.cdi-section#campanha-fome .image-wrapper img'
    },
    eventos: {
        section: 'eventos',
        titleSelector: '.eventos-section .container > .fade-in-up h2.section-title',
        descriptionSelector: '.eventos-section .container > .fade-in-up p'
    },
    'faca-parte': {
        section: 'faca-parte',
        titleSelector: '.cta-section .cta-box h2',
        descriptionSelector: null
    }
};

const HOME_DEFAULT_CONTENT = {
    hero: {
        title: '63 anos de um trabalho de amor!',
        description: 'O CACS | Complexo Assistencial Cairbar Schutel, organização filantrópica sem fins lucrativos, foi criado em 17 de janeiro de 1963 movido pela busca de uma sociedade mais justa e com mais oportunidades.',
        image_url: 'assets/img/hero-bg.jpg'
    },
    sobre: {
        title: 'CACS',
        description: 'O CACS | Complexo Assistencial Cairbar Schutel, organização filantrópica sem fins lucrativos, fundado em 17 de janeiro de 1963, movido pela busca de uma sociedade mais justa e com mais oportunidades, trabalhando para resgatar a dignidade e fomentar a autonomia de pessoas em situação de vulnerabilidade.',
        image_url: 'assets/img/Home-CACS.jpeg'
    },
    servicos: {
        title: 'Programa de Acolhimento',
        description: 'O Acolhimento Psicológico oferece atendimento gratuito para pessoas em situação de vulnerabilidade social em São Paulo, com psicólogos voluntários qualificados.',
        image_url: 'assets/img/7. Acolhimento Psicológico.png'
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
    campanhaFome: {
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

const HOME_SYNC_CHANNEL = 'home-content-sync';
const HOME_CACHE_KEY = 'home-content-cache';

function getHomePageAssetPrefix() {
    return `${window.location.origin}/`;
}

function normalizeHomeImageUrl(imageUrl) {
    const value = String(imageUrl || '').trim();

    if (!value) {
        return '';
    }

    if (/^(data:|https?:\/\/|\/\/)/i.test(value)) {
        return value;
    }

    return value.replace(/^\.\//, '').replace(/^\//, '');
}

function getHomeSupabaseClient() {
    return window.supabaseConfig?.getSupabaseClient?.() || null;
}

async function ensureHomeSupabaseClient() {
    if (!window.supabaseConfig?.initSupabaseClient) {
        return null;
    }

    await window.supabaseConfig.initSupabaseClient();
    return getHomeSupabaseClient();
}

function findHomeRow(rows, section) {
    if (section === 'acolhimento') {
        return rows.find((row) => row.section === 'acolhimento')
            || rows.find((row) => row.section === 'servicos')
            || HOME_DEFAULT_CONTENT[section];
    }

    return rows.find((row) => row.section === section) || HOME_DEFAULT_CONTENT[section];
}

function readCachedHomeContent() {
    try {
        const raw = localStorage.getItem(HOME_CACHE_KEY);
        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function applyHomeSectionContent(sectionName, content) {
    const config = HOME_CONTENT_SECTIONS[sectionName];
    if (!config) {
        return;
    }

    const titleElement = document.querySelector(config.titleSelector);
    const descriptionElement = config.descriptionSelector ? document.querySelector(config.descriptionSelector) : null;
    const imageElement = document.querySelector(config.imageSelector);

    if (titleElement && content.title) {
        titleElement.textContent = content.title;
    }

    if (descriptionElement && content.description) {
        descriptionElement.textContent = content.description;
    }

    if (imageElement && content.image_url) {
        const normalizedImageUrl = normalizeHomeImageUrl(content.image_url);
        if (imageElement.tagName === 'IMG') {
            imageElement.src = normalizedImageUrl;
        } else {
            imageElement.style.backgroundImage = `url('${normalizedImageUrl}')`;
        }
    }
}

async function carregarConteudoHome() {
    const cachedContent = readCachedHomeContent();

    Object.keys(HOME_CONTENT_SECTIONS).forEach((sectionName) => {
        if (cachedContent[sectionName]) {
            applyHomeSectionContent(sectionName, cachedContent[sectionName]);
        }
    });

    const client = await ensureHomeSupabaseClient();

    if (!client) {
        return;
    }

    const { data, error } = await client
        .from('home_content')
        .select('*')
        .in('section', Object.keys(HOME_CONTENT_SECTIONS))
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('❌ Erro ao carregar conteúdo da home:', error.message);
        return;
    }

    const rows = data || [];

    Object.keys(HOME_CONTENT_SECTIONS).forEach((sectionName) => {
        const content = findHomeRow(rows, sectionName);
        applyHomeSectionContent(sectionName, content);
    });
}

function setupHomeContentSync() {
    const reloadHomeContent = () => {
        const cachedContent = readCachedHomeContent();
        Object.keys(HOME_CONTENT_SECTIONS).forEach((sectionName) => {
            if (cachedContent[sectionName]) {
                applyHomeSectionContent(sectionName, cachedContent[sectionName]);
            }
        });

        carregarConteudoHome();
    };

    window.addEventListener('storage', (event) => {
        if (event.key === 'home-content-updated') {
            reloadHomeContent();
        }
    });

    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(HOME_SYNC_CHANNEL);
        channel.addEventListener('message', (event) => {
            if (event.data?.type === 'home-content-updated') {
                reloadHomeContent();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupHomeContentSync();
    carregarConteudoHome();
});