/**
 * Configuração do Supabase
 * 
 * Este arquivo inicializa o cliente Supabase para comunicação com o banco de dados.
 * As variáveis de ambiente são carregadas de forma diferente dependendo do ambiente.
 */

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// Detectar ambiente e carregar variáveis
if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Ambiente Vite
    SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
} else if (typeof process !== 'undefined' && process.env) {
    // Ambiente Node.js
    SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
} else {
    // Fallback: variáveis globais do window
    SUPABASE_URL = window.__SUPABASE_URL__ || '';
    SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || '';
}

// Validação
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Variáveis de ambiente Supabase não configuradas. Configure .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

/**
 * Cliente Supabase global
 * Para usar: await supabaseClient.from('posts').select('*')
 */
let supabaseClient = null;

/**
 * Inicializar cliente Supabase (chamado uma única vez)
 */
async function initSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    
    // Carregar biblioteca Supabase dinamicamente
    if (!window.supabase) {
        // Script já deve estar carregado no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@latest"></script>
        console.error('❌ Biblioteca Supabase não carregada. Adicione o script no HTML.');
        return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

/**
 * Obter instância do cliente Supabase
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        console.error('❌ Cliente Supabase não inicializado. Chame initSupabaseClient() primeiro.');
        return null;
    }
    return supabaseClient;
}

/**
 * Verificar se está autenticado
 */
async function isAuthenticated() {
    const client = getSupabaseClient();
    if (!client) return false;

    const { data: { session } } = await client.auth.getSession();
    return !!session;
}

/**
 * Obter usuário atual
 */
async function getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data: { user } } = await client.auth.getUser();
    return user;
}

/**
 * Logout
 */
async function logoutSupabase() {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.auth.signOut();
    if (error) {
        console.error('❌ Erro ao fazer logout:', error.message);
        return false;
    }
    return true;
}

// Exportar para uso em outros arquivos
window.supabaseConfig = {
    initSupabaseClient,
    getSupabaseClient,
    isAuthenticated,
    getCurrentUser,
    logoutSupabase,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
};

export { initSupabaseClient, getSupabaseClient, isAuthenticated, getCurrentUser, logoutSupabase };
