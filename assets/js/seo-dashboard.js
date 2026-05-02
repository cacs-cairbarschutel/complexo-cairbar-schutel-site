/**
 * Dashboard SEO - Script para buscar e exibir dados do Google Search Console
 */

// IDs do Supabase
const SUPABASE_URL = 'https://ylcvwikjelkqgehvaobq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_KilOBnCNArQ22tGBILNQLQ_-9hZdw4U'
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/seo-api`

// Cache para evitar várias requisições
let cachedData = null
let lastRequestTime = 0

/**
 * Mostrar mensagem de erro
 */
function showError(message) {
    const container = document.getElementById('messageContainer')
    container.innerHTML = `<div class="error-message">❌ ${message}</div>`
    container.style.display = 'block'
}

/**
 * Mostrar mensagem de sucesso
 */
function showSuccess(message) {
    const container = document.getElementById('messageContainer')
    container.innerHTML = `<div class="success-message">✅ ${message}</div>`
    container.style.display = 'block'
}

/**
 * Limpar mensagens
 */
function clearMessages() {
    document.getElementById('messageContainer').innerHTML = ''
    document.getElementById('messageContainer').style.display = 'none'
}

/**
 * Buscar dados do SEO
 */
async function loadSEOData() {
    try {
        clearMessages()

        // Mostrar loading
        document.getElementById('loadingContainer').style.display = 'block'
        document.getElementById('metricsContainer').style.display = 'none'
        document.getElementById('keywordsContainer').style.display = 'none'

        // Obter valores dos selects
        const days = document.getElementById('daysSelect').value
        const dimension = document.getElementById('dimensionSelect').value

        console.log(`📊 Buscando dados: days=${days}, dimension=${dimension}`)

        // Fazer requisição à Edge Function
        const response = await fetch(`${EDGE_FUNCTION_URL}?days=${days}&dimension=${dimension}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
        })

        console.log(`Response status: ${response.status}`)

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Erro HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 Dados recebidos:', data)

        if (!data.rows || data.rows.length === 0) {
            showError('Nenhum dado disponível no período selecionado.')
            document.getElementById('loadingContainer').style.display = 'none'
            return
        }

        // Processar e exibir dados
        processAndDisplayData(data.rows)
        
        showSuccess(`✅ Dados atualizados com sucesso! ${data.rows.length} registros encontrados.`)
        document.getElementById('loadingContainer').style.display = 'none'
        document.getElementById('metricsContainer').style.display = 'grid'
        document.getElementById('keywordsContainer').style.display = 'block'

    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error)
        showError(`Erro ao buscar dados: ${error.message}`)
        document.getElementById('loadingContainer').style.display = 'none'
    }
}

/**
 * Processar e exibir dados
 */
function processAndDisplayData(rows) {
    console.log('Processing', rows.length, 'rows')

    // Calcular métricas totais
    let totalClicks = 0
    let totalImpressions = 0
    let totalCTR = 0
    let totalPosition = 0

    rows.forEach((row) => {
        totalClicks += row.clicks || 0
        totalImpressions += row.impressions || 0
        totalCTR += row.ctr || 0
        totalPosition += row.position || 0
    })

    // Calcular médias
    const avgCTR = ((totalCTR / rows.length) * 100).toFixed(2)
    const avgPosition = (totalPosition / rows.length).toFixed(1)

    // Atualizar Métricas
    document.getElementById('totalClicks').textContent = totalClicks.toLocaleString('pt-BR')
    document.getElementById('totalImpressions').textContent = totalImpressions.toLocaleString('pt-BR')
    document.getElementById('avgCTR').textContent = `${avgCTR}%`
    document.getElementById('avgPosition').textContent = avgPosition

    // Preencher tabela de keywords/queries
    const tableBody = document.getElementById('keywordsTable')
    tableBody.innerHTML = rows
        .slice(0, 50) // Top 50
        .map((row, index) => {
            const keyword = row.keys ? row.keys[0] : 'N/A'
            const clicks = row.clicks || 0
            const impressions = row.impressions || 0
            const ctr = ((row.ctr || 0) * 100).toFixed(2)
            const position = (row.position || 0).toFixed(1)

            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(keyword)}</strong>
                    </td>
                    <td style="text-align: center;">
                        <strong style="color: var(--secondary-color);">${clicks.toLocaleString('pt-BR')}</strong>
                    </td>
                    <td style="text-align: center;">
                        ${impressions.toLocaleString('pt-BR')}
                    </td>
                    <td style="text-align: center;">
                        ${ctr}%
                    </td>
                    <td style="text-align: center;">
                        <span class="rank-badge">#${position}</span>
                    </td>
                </tr>
            `
        })
        .join('')

    console.log('✅ Dados exibidos com sucesso')
}

/**
 * Escaper HTML para segurança
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}

// Carregar dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard SEO carregado')
    loadSEOData()

    // Auto-atualizar a cada 5 minutos
    setInterval(loadSEOData, 5 * 60 * 1000)
})
