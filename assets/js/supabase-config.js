/**
 * Configuração da API (Migração Neon)
 * 
 * Este arquivo foi adaptado para se comunicar com um backend personalizado
 * que utiliza o Neon PostgreSQL, substituindo o SDK do Supabase.
 */

const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.startsWith('192.168.') ||
                 window.location.hostname === '' ||
                 window.location.protocol === 'file:';

const API_BASE_URL = isLocal 
    ? 'http://localhost:3000/api' 
    : 'https://complexo-cairbar-schutel-site.vercel.app/api';

/**
 * Cliente Mock para manter compatibilidade com o código existente
 */
const supabaseClient = {
    from: (table) => {
        const normalizedTable = table.replace(/_/g, '-');
        
        const createQueryBuilder = () => {
            const builder = {
                select: (columns) => builder,
                eq: (col, val) => {
                    if (col === 'id') {
                        builder._id = val;
                    }
                    builder._query = builder._query ? `${builder._query}&${col}=${val}` : `${col}=${val}`;
                    return builder;
                },
                in: (col, vals) => {
                    builder._query = builder._query ? `${builder._query}&sections=${vals.join(',')}` : `sections=${vals.join(',')}`;
                    return builder;
                },
                order: (col, opts) => builder,
                single: () => {
                    builder._single = true;
                    return builder;
                },
                limit: (n) => builder,
                
                // Implementação do Thenable para o await funcionar em qualquer ponto da cadeia
                then: (resolve) => {
                    const url = builder._id 
                        ? `${API_BASE_URL}/${normalizedTable}/${builder._id}`
                        : `${API_BASE_URL}/${normalizedTable}${builder._query ? '?' + builder._query : ''}`;
                    
                    fetch(url)
                        .then(r => {
                            if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                            return r.json();
                        })
                        .then(data => {
                            let processedData = data;
                            if (builder._single && Array.isArray(data)) {
                                processedData = data[0] || null;
                            }
                            resolve({ data: processedData, error: null });
                        })
                        .catch(err => {
                            console.error(`❌ Erro na API (${normalizedTable}):`, err.message);
                            resolve({ data: null, error: err });
                        });
                },
                
                // Métodos de mutação
                insert: (data) => {
                    return {
                        select: () => ({
                            single: () => fetch(`${API_BASE_URL}/${normalizedTable}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data[0])
                            }).then(r => r.json().then(data => ({ data, error: null })))
                        })
                    };
                },
                update: (data) => {
                    return {
                        eq: (col, val) => ({
                            select: () => ({
                                single: () => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                }).then(r => r.json().then(data => ({ data, error: null })))
                            })
                        })
                    };
                },
                delete: () => {
                    return {
                        eq: (col, val) => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, { method: 'DELETE' }).then(r => r.json().then(data => ({ data, error: null })))
                    };
                }
            };
            return builder;
        };

        return createQueryBuilder();
    },
    storage: {
        from: (bucket) => ({
            upload: (path, file) => {
                const formData = new FormData();
                formData.append('image', file);
                return fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    body: formData
                }).then(r => r.json().then(data => ({ data, error: null })));
            },
            getPublicUrl: (path) => ({ data: { publicUrl: `${API_BASE_URL.replace('/api', '')}/uploads/${path.split('/').pop()}` } })
        })
    }
};

async function initSupabaseClient() {
    console.log('🚀 API Client (Neon Migration) inicializado');
    window.supabase = supabaseClient; // Mock para compatibilidade
    return supabaseClient;
}

function getSupabaseClient() {
    return supabaseClient;
}

// Manter funções de Auth (usando a lógica local do admin-access.js)
async function isAuthenticated() {
    return !!sessionStorage.getItem('cacs-admin-session');
}

window.supabaseConfig = {
    initSupabaseClient,
    getSupabaseClient,
    isAuthenticated,
    API_BASE_URL
};

