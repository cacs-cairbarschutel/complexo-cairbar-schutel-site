import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para gerar JWT usando algoritmo RS256
async function generateJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id,
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  }

  // Encode header e payload em base64url
  const headerEncoded = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const payloadEncoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const message = `${headerEncoded}.${payloadEncoded}`

  // Importar crypto para assinar
  const encoder = new TextEncoder()
  const keyData = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '')

  const binaryString = atob(keyData)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const key = await crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(message)
  )

  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${message}.${signatureBase64}`
}

// Função para buscar token do Google
async function getGoogleAccessToken(
  serviceAccount: any
): Promise<string> {
  const jwt = await generateJWT(serviceAccount)

  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenResponse.json() as any
  return tokenData.access_token
}

// Função principal da Edge Function
serve(async (req) => {
  // Suportar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obter credenciais do Supabase Secrets
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')

    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT secret não configurado no Supabase')
    }

    const serviceAccount = JSON.parse(serviceAccountJson)

    // Obter token de acesso
    console.log('📝 Gerando JWT...')
    const accessToken = await getGoogleAccessToken(serviceAccount)
    console.log('✅ Token obtido com sucesso')

    // Parâmetros da requisição
    const url = new URL(req.url)
    const siteUrl = url.searchParams.get('site') || 'https://cacs-cairbarschutel.org.br'
    const daysBack = parseInt(url.searchParams.get('days') || '30')
    const dimension = url.searchParams.get('dimension') || 'query'

    // Calcular datas
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`📊 Buscando dados de: ${startDateStr} até ${endDateStr}`)
    console.log(`🔍 Dimension: ${dimension}`)

    // Fazer requisição ao Google Search Console API
    const encodedSite = encodeURIComponent(`sc-domain:${siteUrl.replace(/https?:\/\//, '')}`)

    const searchConsoleResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: [dimension],
          rowLimit: 100,
          dataState: 'all',
        }),
      }
    )

    if (!searchConsoleResponse.ok) {
      const error = await searchConsoleResponse.text()
      throw new Error(`Google API Error: ${error}`)
    }

    const data = await searchConsoleResponse.json()

    console.log(`✅ ${data.rows?.length || 0} linhas retornadas`)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('❌ Erro:', error.message)

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao buscar dados de SEO',
        status: 'error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
