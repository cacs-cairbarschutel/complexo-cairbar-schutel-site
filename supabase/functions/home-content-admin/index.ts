import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HOME_IMAGE_BUCKET = 'home-images'

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

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurado')
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const formData = await req.formData()
    const section = String(formData.get('section') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const imageUrlFallback = String(formData.get('image_url') || '').trim()
    const imageFile = formData.get('image')

    if (!section || !title || !description) {
      throw new Error('section, title e description são obrigatórios')
    }

    let imageUrl = imageUrlFallback

    if (imageFile instanceof File && imageFile.size > 0) {
      const safeFileName = `${section}-${Date.now()}-${imageFile.name}`.replace(/\s+/g, '-')
      const filePath = `${section}/${safeFileName}`

      const { error: uploadError } = await client.storage
        .from(HOME_IMAGE_BUCKET)
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: imageFile.type || 'application/octet-stream',
        })

      if (uploadError) {
        throw new Error(`Erro ao enviar imagem: ${uploadError.message}`)
      }

      const { data: publicUrlData } = client.storage.from(HOME_IMAGE_BUCKET).getPublicUrl(filePath)
      imageUrl = publicUrlData.publicUrl
    }

    const { data, error } = await client
      .from('home_content')
      .upsert(
        {
          section,
          title,
          description,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section' }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao salvar conteúdo: ${error.message}`)
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})