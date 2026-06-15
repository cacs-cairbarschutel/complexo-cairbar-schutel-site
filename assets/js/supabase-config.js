/**
 * Configuração da API (Migração Neon)
 * 
 * Este arquivo foi adaptado para se comunicar com um backend personalizado
 * que utiliza o Neon PostgreSQL, substituindo o SDK do Supabase.
 */

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

/**
 * Cliente Mock para manter compatibilidade com o código existente
 */
const supabaseClient = {
    from: (table) => {
        const normalizedTable = table.replace(/_/g, '-');
        return {
            select: (columns) => ({
                eq: (col, val) => ({
                    order: (col, opts) => fetch(`${API_BASE_URL}/${normalizedTable}?${col}=${val}`).then(r => r.json().then(data => ({ data, error: null }))),
                    single: () => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`).then(r => r.json().then(data => ({ data, error: null })))
                }),
                in: (col, vals) => ({
                    order: (col, opts) => fetch(`${API_BASE_URL}/${normalizedTable}?sections=${vals.join(',')}`).then(r => r.json().then(data => ({ data, error: null }))),
                    then: (fn) => fetch(`${API_BASE_URL}/${normalizedTable}?sections=${vals.join(',')}`).then(r => r.json().then(data => fn({ data, error: null })))
                }),
                order: (col, opts) => fetch(`${API_BASE_URL}/${normalizedTable}`).then(r => r.json().then(data => ({ data, error: null })))
            }),
            insert: (data) => ({
                select: () => ({
                    single: () => fetch(`${API_BASE_URL}/${normalizedTable}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data[0])
                    }).then(r => r.json().then(data => ({ data, error: null })))
                })
            }),
            update: (data) => ({
                eq: (col, val) => ({
                    select: () => ({
                        single: () => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        }).then(r => r.json().then(data => ({ data, error: null })))
                    })
                })
            }),
            delete: () => ({
                eq: (col, val) => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, { method: 'DELETE' }).then(r => r.json().then(data => ({ data, error: null })))
            })
        };
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

