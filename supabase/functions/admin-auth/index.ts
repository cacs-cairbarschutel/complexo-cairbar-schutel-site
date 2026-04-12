import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CODE_TTL_MINUTES = 15
const SESSION_TTL_HOURS = 8
const ADMIN_CODE_BUCKET = 'admin-login-codes'
const MAILER_API_URL = 'https://api.resend.com/emails'

type ActionType = 'request' | 'verify' | 'validate' | 'logout'
type PurposeType = 'login'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('ADMIN_FROM_EMAIL')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurado')
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const payload = await req.json()
    const action = String(payload.action || 'request') as ActionType

      if (action === 'request') {
        return await handleRequestCode(client, payload, resendApiKey, fromEmail)
    }

    if (action === 'verify') {
      return await handleVerifyCode(client, payload)
    }

    if (action === 'validate') {
      return await handleValidateSession(client, payload)
    }

    if (action === 'logout') {
      return await handleLogout(client, payload)
    }

    throw new Error('Ação inválida')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function handleRequestCode(
  client: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  resendApiKey: string | undefined,
  fromEmail: string | undefined,
) {
  const email = String(payload.email || '').trim().toLowerCase()
  const purpose = normalizePurpose(payload.purpose)

  if (!email) {
    throw new Error('E-mail é obrigatório')
  }

  const { data: userRow } = await client
    .from('admin_users')
    .select('email, display_name, is_active')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle()

  if (!userRow) {
    return new Response(JSON.stringify({ ok: true, message: 'Se o e-mail estiver autorizado, um código será enviado.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  const code = generateCode()
  const codeHash = await hashCode(code)
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString()

  await client
    .from('admin_login_codes')
    .delete()
    .eq('email', email)
    .eq('purpose', purpose)

  const { error: insertError } = await client
    .from('admin_login_codes')
    .insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
    })

  if (insertError) {
    throw new Error(`Erro ao registrar código: ${insertError.message}`)
  }

  await sendAdminEmail({
    resendApiKey,
    fromEmail,
    toEmail: email,
    displayName: String(userRow.display_name || email),
    code,
    purpose,
  })

  return new Response(JSON.stringify({ ok: true, message: 'Se o e-mail estiver autorizado, um código será enviado.' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function handleVerifyCode(client: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const email = String(payload.email || '').trim().toLowerCase()
  const purpose = normalizePurpose(payload.purpose)
  const code = String(payload.code || '').trim()

  if (!email || !code) {
    throw new Error('E-mail e código são obrigatórios')
  }

  const { data: codeRow, error: codeError } = await client
    .from('admin_login_codes')
    .select('id, code_hash, expires_at, used_at')
    .eq('email', email)
    .eq('purpose', purpose)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (codeError) {
    throw new Error(`Erro ao validar código: ${codeError.message}`)
  }

  if (!codeRow) {
    throw new Error('Código inválido ou expirado')
  }

  if (new Date(String(codeRow.expires_at)).getTime() < Date.now()) {
    throw new Error('Código expirado')
  }

  const isValid = await verifyCode(code, String(codeRow.code_hash))
  if (!isValid) {
    throw new Error('Código inválido')
  }

  await client
    .from('admin_login_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', codeRow.id)

  const sessionToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString()

  const { error: sessionError } = await client
    .from('admin_sessions')
    .insert({
      token: sessionToken,
      email,
      expires_at: expiresAt,
    })

  if (sessionError) {
    throw new Error(`Erro ao criar sessão: ${sessionError.message}`)
  }

  return new Response(JSON.stringify({ ok: true, token: sessionToken, email, expires_at: expiresAt }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function handleValidateSession(client: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const token = String(payload.session_token || '').trim()

  if (!token) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  const { data: sessionRow, error } = await client
    .from('admin_sessions')
    .select('token, email, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    throw new Error(`Erro ao validar sessão: ${error.message}`)
  }

  if (!sessionRow) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  if (new Date(String(sessionRow.expires_at)).getTime() < Date.now()) {
    await client.from('admin_sessions').delete().eq('token', token)
    return new Response(JSON.stringify({ ok: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  return new Response(JSON.stringify({ ok: true, email: sessionRow.email, expires_at: sessionRow.expires_at }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function handleLogout(client: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const token = String(payload.session_token || '').trim()

  if (token) {
    await client.from('admin_sessions').delete().eq('token', token)
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

function normalizePurpose(value: unknown): PurposeType {
  return 'login'
}

function generateCode() {
  return String(Math.floor(10000 + Math.random() * 90000))
}

async function hashCode(code: string) {
  const encoder = new TextEncoder().encode(code)
  const hash = await crypto.subtle.digest('SHA-256', encoder)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyCode(code: string, expectedHash: string) {
  const actualHash = await hashCode(code)
  return actualHash === expectedHash
}

async function sendAdminEmail(params: {
  resendApiKey: string | undefined
  fromEmail: string | undefined
  toEmail: string
  displayName: string
  code: string
  purpose: PurposeType
}) {
  if (!params.resendApiKey || !params.fromEmail) {
    throw new Error('RESEND_API_KEY ou ADMIN_FROM_EMAIL não configurado')
  }

  const subject = 'Código de acesso CACS'

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 16px; color: #c41834;">Olá, ${escapeHtml(params.displayName)}.</h2>
      <p style="margin: 0 0 12px;">Seu código de acesso é:</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 12px 0 18px; color: #111827;">${params.code}</div>
      <p style="margin: 0 0 12px;">Esse código tem validade de ${CODE_TTL_MINUTES} minutos e pode ser usado apenas uma vez.</p>
      <p style="margin: 0;">Se você não solicitou esse acesso, ignore este e-mail.</p>
    </div>
  `

  const response = await fetch(MAILER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.fromEmail,
      to: [params.toEmail],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(`Falha ao enviar e-mail: ${responseText}`)
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
