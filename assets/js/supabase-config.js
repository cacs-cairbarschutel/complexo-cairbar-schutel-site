/**
 * Configuração do Supabase
 * 
 * Este arquivo inicializa o cliente Supabase para comunicação com o banco de dados.
 * As variáveis de ambiente são carregadas de forma diferente dependendo do ambiente.
 */

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// Detectar ambiente e carregar variáveis
// 1. Primeiro tenta credenciais injetadas no window (para sites estáticos)
if (window.__SUPABASE_CREDENTIALS__) {
    SUPABASE_URL = window.__SUPABASE_CREDENTIALS__.url;
    SUPABASE_ANON_KEY = window.__SUPABASE_CREDENTIALS__.key;
    console.log('✅ Credenciais carregadas do window');
}

// Validação
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Variáveis de ambiente Supabase não configuradas. Configure .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    console.warn('❌ SUPABASE_URL:', SUPABASE_URL);
    console.warn('❌ SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);
} else {
    console.log('✅ Supabase URL:', SUPABASE_URL);
    console.log('✅ Supabase configured');
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
    console.log('🚀 initSupabaseClient() chamado');
    
    if (supabaseClient) {
        console.log('✅ Cliente Supabase já estava inicializado');
        return supabaseClient;
    }
    
    // Carregar biblioteca Supabase dinamicamente
    if (!window.supabase) {
        console.error('❌ window.supabase não está definido. A biblioteca Supabase não foi carregada no HTML.');
        console.error('Certifique-se de que há uma tag <script> com a CDN do Supabase ANTES dos outros scripts');
        return null;
    }

    console.log('✅ window.supabase encontrado, criando cliente...');
    console.log('📍 URL:', SUPABASE_URL);
    console.log('🔑 KEY:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NÃO DEFINIDA');

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase criado com sucesso');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Erro ao criar cliente Supabase:', error);
        return null;
    }
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

// Exportar para uso em outros arquivos (window namespace)
window.supabaseConfig = {
    initSupabaseClient,
    getSupabaseClient,
    isAuthenticated,
    getCurrentUser,
    logoutSupabase,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
};

console.log('✅ supabaseConfig exportado para window');
