/**
 * Configuração da API do backend
 */

const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.startsWith('192.168.') ||
                window.location.hostname === '' ||
                window.location.protocol === 'file:';

const API_BASE_URL = isLocal
    ? 'http://localhost:3000/api'
    : 'https://complexo-cairbar-schutel-site.vercel.app/api';

const apiClient = {
    from: (table) => {
        const normalizedTable = table.replace(/_/g, '-');

        const createQueryBuilder = () => {
            const builder = {
                select: (cols) => {
                    if (cols && cols !== '*') {
                        builder._query = builder._query ? `${builder._query}&fields=${cols}` : `fields=${cols}`;
                    }
                    return builder;
                },
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
                order: () => builder,
                single: () => {
                    builder._single = true;
                    return builder;
                },
                limit: (count) => {
                    if (count) {
                        builder._query = builder._query ? `${builder._query}&limit=${count}` : `limit=${count}`;
                    }
                    return builder;
                },
                then: (resolve) => {
                    const url = builder._id
                        ? `${API_BASE_URL}/${normalizedTable}/${builder._id}`
                        : `${API_BASE_URL}/${normalizedTable}${builder._query ? '?' + builder._query : ''}`;

                    fetch(url)
                        .then(async (response) => {
                            const responseData = await response.json();
                            if (!response.ok) {
                                throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
                            }
                            return responseData;
                        })
                        .then((data) => {
                            let processedData = data;
                            if (builder._single && Array.isArray(data)) {
                                processedData = data[0] || null;
                            }
                            resolve({ data: processedData, error: null });
                        })
                        .catch((error) => {
                            console.error(`Erro na API (${normalizedTable}):`, error.message);
                            resolve({ data: null, error });
                        });
                },
                insert: (data) => ({
                    select: () => ({
                        single: () => fetch(`${API_BASE_URL}/${normalizedTable}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data[0])
                        }).then(async (response) => {
                            const responseData = await response.json();
                            if (!response.ok) {
                                return { data: null, error: new Error(responseData.error || `HTTP error! status: ${response.status}`) };
                            }
                            return { data: responseData, error: null };
                        })
                    })
                }),
                update: (data) => ({
                    eq: (col, val) => ({
                        select: () => ({
                            single: () => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            }).then(async (response) => {
                                const responseData = await response.json();
                                if (!response.ok) {
                                    return { data: null, error: new Error(responseData.error || `HTTP error! status: ${response.status}`) };
                                }
                                return { data: responseData, error: null };
                            })
                        })
                    })
                }),
                delete: () => ({
                    eq: (col, val) => fetch(`${API_BASE_URL}/${normalizedTable}/${val}`, {
                        method: 'DELETE'
                    }).then(async (response) => {
                        const responseData = await response.json();
                        if (!response.ok) {
                            return { data: null, error: new Error(responseData.error || `HTTP error! status: ${response.status}`) };
                        }
                        return { data: responseData, error: null };
                    })
                })
            };
            return builder;
        };

        return createQueryBuilder();
    },
    storage: {
        from: () => ({
            upload: (path, file) => {
                const formData = new FormData();
                formData.append('image', file);
                return fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    body: formData
                }).then((response) => response.json().then((data) => ({ data, error: null })));
            },
            getPublicUrl: (path) => ({
                data: { publicUrl: `${API_BASE_URL.replace('/api', '')}/uploads/${path.split('/').pop()}` }
            })
        })
    }
};

async function initApiClient() {
    return apiClient;
}

function getApiClient() {
    return apiClient;
}

async function isAuthenticated() {
    return !!sessionStorage.getItem('cacs-admin-session');
}

window.apiConfig = {
    initApiClient,
    getApiClient,
    isAuthenticated,
    API_BASE_URL
};

window.supabaseConfig = window.apiConfig;
