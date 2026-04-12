const ADMIN_AUTH_SESSION_KEY = 'cacs-admin-session';
const ADMIN_AUTH_ID_KEY = 'cacs-admin-id';
const ADMIN_AUTH_TARGET_KEY = 'cacs-admin-target';

const ADMIN_SESSION_TTL_HOURS = 8;

const ADMIN_CREDENTIALS = [
    {
        id: 'ADM-CA01',
        password: 'Cacs@7mL9',
        label: 'Administrador único',
    },
];

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

function findAdminCredential(adminId) {
    const normalizedAdminId = normalizeAdminId(adminId);
    return ADMIN_CREDENTIALS.find((credential) => credential.id === normalizedAdminId) || null;
}

function isAdminSessionValid(session) {
    if (!session?.token || !session?.adminId || !session?.expires_at) {
        return false;
    }

    if (new Date(String(session.expires_at)).getTime() < Date.now()) {
        return false;
    }

    return Boolean(findAdminCredential(session.adminId));
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

function buildAdminSession(adminId, target) {
    return {
        token: generateSessionToken(),
        adminId,
        target,
        expires_at: new Date(Date.now() + ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString(),
    };
}

function generateSessionToken() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `cacs-${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

function authenticateAdmin(target) {
    const adminIdInput = document.getElementById('admin-id');
    const passwordInput = document.getElementById('admin-password');
    const adminId = normalizeAdminId(adminIdInput?.value);
    const password = String(passwordInput?.value || '').trim();

    if (!adminId || !password) {
        setLoginStatus('Informe o ID e a senha para continuar.', 'error');
        return;
    }

    const credential = findAdminCredential(adminId);

    if (!credential || credential.password !== password) {
        setLoginStatus('ID ou senha inválidos.', 'error');
        return;
    }

    const session = buildAdminSession(credential.id, target);
    saveAdminSession(session);

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
                authenticateAdmin(target);
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
