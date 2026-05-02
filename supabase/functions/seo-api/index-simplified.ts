import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Iniciando requisição SEO API...')
    
    // Obter credenciais do Supabase Secret
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')
    
    if (!serviceAccountJson) {
      throw new Error('❌ Secret GOOGLE_SERVICE_ACCOUNT não configurado no Supabase!')
    }

    console.log('✅ Secret encontrado')
    
    const serviceAccount = JSON.parse(serviceAccountJson)

    // Parâmetros da requisição
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const dimension = url.searchParams.get('dimension') || 'query'
    const siteUrl = url.searchParams.get('site') || 'https://cacs-cairbarschutel.org.br'

    // Calcular datas
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`📊 Buscando de ${startDateStr} até ${endDateStr}`)
    console.log(`🔍 Dimensão: ${dimension}`)

    // Gerar JWT manualmente
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

    // Codificar JWT
    const headerEncoded = btoa(JSON.stringify(header))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    
    const payloadEncoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    const message = `${headerEncoded}.${payloadEncoded}`

    // Preparar chave privada
    const keyData = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\n/g, '')
      .trim()

    const binaryString = atob(keyData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Assinar JWT
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
      new TextEncoder().encode(message)
    )

    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    const jwt = `${message}.${signatureBase64}`
    console.log('✅ JWT gerado com sucesso')

    // Obter token de acesso do Google
    console.log('🔑 Obtendo token de acesso...')
    
    const tokenResponse = await fetch(serviceAccount.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    const tokenData = await tokenResponse.json() as any
    
    if (!tokenData.access_token) {
      throw new Error(`❌ Erro ao obter token: ${JSON.stringify(tokenData)}`)
    }

    const accessToken = tokenData.access_token
    console.log('✅ Token obtido')

    // Requisição ao Google Search Console API
    const encodedSite = encodeURIComponent(`sc-domain:${siteUrl.replace(/https?:\/\//, '')}`)

    console.log(`📡 Consultando Google Search Console para: ${encodedSite}`)

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
      throw new Error(`❌ Google API Error (${searchConsoleResponse.status}): ${error}`)
    }

    const data = await searchConsoleResponse.json()
    console.log(`✅ ${data.rows?.length || 0} linhas retornadas`)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('❌ ERRO:', error.message)
    console.error('Stack:', error.stack)

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
