/**
 * page-content.js
 *
 * Carrega conteúdo dinâmico do banco para páginas internas.
 * Cada página deve incluir este script e definir window.PAGE_KEY
 * antes de carregá-lo. Ex: <script>window.PAGE_KEY = 'cdi';</script>
 *
 * Elementos alvo nas páginas (identificados por data-content):
 *   data-content="hero-title"       → h1 do topo
 *   data-content="hero-description" → parágrafo do subtítulo no hero
 *   data-content="sobre-title"      → h2 da seção "Sobre"
 *   data-content="sobre-description"→ primeiro parágrafo da seção "Sobre"
 *   data-content="sobre-image"      → img da seção "Sobre"
 */

(function () {
    const PAGE_KEY = window.PAGE_KEY;
    if (!PAGE_KEY) return;

    const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname === '' ||
        window.location.protocol === 'file:';

    const API_BASE = isLocal
        ? 'http://localhost:3000/api'
        : 'https://complexo-cairbar-schutel-site.vercel.app/api';

    const sections = [
        `${PAGE_KEY}--hero`,
        `${PAGE_KEY}--sobre`,
        `${PAGE_KEY}--historia`
    ];

    async function loadContent() {
        try {
            const url = `${API_BASE}/home-content?sections=${encodeURIComponent(sections.join(','))}`;
            const res = await fetch(url);
            if (!res.ok) return;
            const rows = await res.json();

            if (!Array.isArray(rows) || rows.length === 0) return;

            const bySection = {};
            rows.forEach(row => { bySection[row.section] = row; });

            const hero = bySection[`${PAGE_KEY}--hero`];
            const sobre = bySection[`${PAGE_KEY}--sobre`] || bySection[`${PAGE_KEY}--historia`];

            if (hero) {
                injectText('[data-content="hero-title"]', hero.title);
                injectText('[data-content="hero-description"]', hero.description);
                injectImage('[data-content="hero-image"]', hero.image_url);
            }

            if (sobre) {
                injectText('[data-content="sobre-title"]', sobre.title);
                injectText('[data-content="sobre-description"]', sobre.description);
                injectImage('[data-content="sobre-image"]', sobre.image_url);
            }
        } catch (e) {
            // falha silenciosa — conteúdo estático original permanece
        }
    }

    function injectText(selector, value) {
        if (!value) return;
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    }

    function injectImage(selector, value) {
        if (!value) return;
        const el = document.querySelector(selector);
        if (el) {
            el.src = value;
            el.setAttribute('src', value);
        }
    }

    // Executar após o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }
})();
