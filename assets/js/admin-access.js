const ADMIN_AUTH_SESSION_KEY = 'cacs-admin-session';
const ADMIN_AUTH_ID_KEY = 'cacs-admin-id';
const ADMIN_AUTH_TARGET_KEY = 'cacs-admin-target';

const ADMIN_SESSION_TTL_HOURS = 8;

// As credenciais ficam no servidor, em variáveis de ambiente.
// Nenhuma senha é guardada neste arquivo, que é público.

function getAdminTargetFromUrl() {
    const target = new URLSearchParams(window.location.search).get('target');
    return target === 'home' ? 'home' : 'blog';
}

function getAdminLoginPageUrl(target) {
    const normalizedTarget = target === 'home' ? 'home' : 'blog';
    return `login.html?target=${encodeURIComponent(normalizedTarget)}`;
}

function getAdminPanelUrl() {
    return 'painel.html';
}

function getProtectedAdminArea() {
    return document.body?.dataset?.adminArea || '';
}

function getAdminPanelName(area) {
    return area === 'home' ? 'Home' : 'Blog';
}

function readAdminSession() {
    try {
        const raw = sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveAdminSession(session) {
    sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem(ADMIN_AUTH_ID_KEY, session.adminId || '');
    sessionStorage.setItem(ADMIN_AUTH_TARGET_KEY, session.target || 'blog');
}

function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_ID_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_TARGET_KEY);
}

function normalizeAdminId(value) {
    return String(value || '').trim().toUpperCase();
}

function getApiBaseUrl() {
    return (window.apiConfig && window.apiConfig.API_BASE_URL) || '';
}

function isAdminSessionValid(session) {
    if (!session?.token || !session?.adminId || !session?.expires_at) {
        return false;
    }

    if (new Date(String(session.expires_at)).getTime() < Date.now()) {
        return false;
    }

    return true;
}

function readAdminSessionTarget() {
    return sessionStorage.getItem(ADMIN_AUTH_TARGET_KEY) || 'blog';
}

function setLoginStatus(message, type = 'info') {
    const statusBox = document.getElementById('admin-login-status');
    if (!statusBox) {
        return;
    }

    statusBox.textContent = message;
    statusBox.className = `admin-login-status admin-login-status--${type} is-visible`;
}

function updateLoginUiForTarget(target) {
    const title = document.getElementById('login-title');
    const description = document.getElementById('login-description');
    const badge = document.getElementById('login-target-badge');

    const panelName = getAdminPanelName(target);

    if (title) {
        title.textContent = `Entrar no admin ${panelName}`;
    }

    if (description) {
        description.textContent = `Digite seu ID e sua senha cadastrados para acessar o painel de ${panelName.toLowerCase()}.`;
    }

    if (badge) {
        badge.textContent = `Acesso ao painel ${panelName}`;
    }
}

function buildAdminSession(adminId, target, token, expiresInMs) {
    const duracao = expiresInMs || ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000;
    return {
        token: token || generateSessionToken(),
        adminId,
        target,
        expires_at: new Date(Date.now() + duracao).toISOString(),
    };
}

function generateSessionToken() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `cacs-${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

async function authenticateAdmin(target) {
    const adminIdInput = document.getElementById('admin-id');
    const passwordInput = document.getElementById('admin-password');
    const adminId = normalizeAdminId(adminIdInput?.value);
    const password = String(passwordInput?.value || '').trim();

    if (!adminId || !password) {
        setLoginStatus('Informe o ID e a senha para continuar.', 'error');
        return;
    }

    const base = getApiBaseUrl();
    if (!base) {
        setLoginStatus('Não foi possível contatar o servidor. Recarregue a página.', 'error');
        return;
    }

    setLoginStatus('Verificando credenciais...', 'info');

    let resposta;
    let dados;
    try {
        resposta = await fetch(`${base}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: adminId, password }),
        });
        dados = await resposta.json().catch(() => ({}));
    } catch (error) {
        setLoginStatus('Falha de conexão com o servidor. Verifique a internet e tente novamente.', 'error');
        return;
    }

    if (!resposta.ok || !dados.token) {
        setLoginStatus(dados.error || 'ID ou senha inválidos.', 'error');
        return;
    }

    saveAdminSession(buildAdminSession(dados.adminId || adminId, target, dados.token, dados.expiresIn));

    setLoginStatus('Acesso liberado. Redirecionando...', 'success');
    window.location.replace(getAdminPanelUrl());
}

async function ensureAdminAccess() {
    const area = getProtectedAdminArea();

    if (!area) {
        return;
    }

    document.documentElement.style.visibility = 'hidden';

    const session = readAdminSession();
    const target = area === 'home' ? 'home' : readAdminSessionTarget();

    if (!isAdminSessionValid(session)) {
        clearAdminSession();
        window.location.replace(getAdminLoginPageUrl(target));
        return;
    }

    document.documentElement.style.visibility = 'visible';
}

function initLoginPage() {
    const target = getAdminTargetFromUrl();
    updateLoginUiForTarget(target);

    const session = readAdminSession();
    if (isAdminSessionValid(session)) {
        window.location.replace(getAdminPanelUrl());
        return;
    }

    const form = document.getElementById('admin-login-form');
    const loginButton = document.getElementById('login-button');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (loginButton) {
                loginButton.disabled = true;
            }

            try {
                await authenticateAdmin(target);
            } catch (error) {
                setLoginStatus(error.message, 'error');
            } finally {
                if (loginButton) {
                    loginButton.disabled = false;
                }
            }
        });
    }

    setLoginStatus('Insira o ID e a senha cadastrados para entrar.', 'info');
}

function initAdminAccess() {
    try {
        const area = getProtectedAdminArea();

        if (!area) {
            return;
        }

        document.documentElement.style.visibility = 'hidden';

        const session = readAdminSession();
        if (!isAdminSessionValid(session)) {
            clearAdminSession();
            window.location.replace(getAdminLoginPageUrl(area === 'home' ? 'home' : 'blog'));
            return;
        }

        document.documentElement.style.visibility = 'visible';
    } catch (error) {
        clearAdminSession();
        const area = getProtectedAdminArea() || 'blog';
        window.location.replace(getAdminLoginPageUrl(area === 'home' ? 'home' : 'blog'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-login-form')) {
        initLoginPage();
    }

    if (getProtectedAdminArea()) {
        initAdminAccess();
    }
});

window.adminAuth = {
    clearAdminSession,
    readAdminSession,
};

// Anexa o token administrativo a toda requisição de escrita dirigida à API.
// Fica centralizado aqui porque este arquivo é carregado em todas as páginas
// do painel, o que dispensa alterar cada ponto de chamada.
(function interceptaEscritasAdministrativas() {
    if (window.__adminFetchInterceptado) {
        return;
    }
    window.__adminFetchInterceptado = true;

    const fetchOriginal = window.fetch.bind(window);
    const METODOS_DE_ESCRITA = ['POST', 'PUT', 'PATCH', 'DELETE'];

    window.fetch = async function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const metodo = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
        const base = getApiBaseUrl();

        const ehEscritaNaApi = Boolean(base) && url.indexOf(base) === 0 && METODOS_DE_ESCRITA.indexOf(metodo) !== -1;
        const ehLogin = url.indexOf('/admin/login') !== -1;

        if (!ehEscritaNaApi || ehLogin) {
            return fetchOriginal(input, init);
        }

        const sessao = readAdminSession();
        const opcoes = Object.assign({}, init);
        if (sessao && sessao.token) {
            const cabecalhos = new Headers((init && init.headers) || (input && input.headers) || {});
            cabecalhos.set('Authorization', `Bearer ${sessao.token}`);
            opcoes.headers = cabecalhos;
        }

        const resposta = await fetchOriginal(input, opcoes);

        if (resposta.status === 401) {
            clearAdminSession();
            alert('Sua sessão expirou. Entre novamente no painel para continuar.');
            const area = getProtectedAdminArea() || 'blog';
            window.location.replace(getAdminLoginPageUrl(area === 'home' ? 'home' : 'blog'));
        }

        return resposta;
    };
})();
