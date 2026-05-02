-- Acesso administrativo por e-mail + código de 5 dígitos.
-- Execute no SQL Editor do Supabase e ajuste os e-mails autorizados em public.admin_users.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('login')),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_codes_email_idx ON public.admin_login_codes(email);
CREATE INDEX IF NOT EXISTS admin_login_codes_expires_at_idx ON public.admin_login_codes(expires_at DESC);
CREATE INDEX IF NOT EXISTS admin_sessions_email_idx ON public.admin_sessions(email);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON public.admin_sessions(expires_at DESC);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny all admin_login_codes" ON public.admin_login_codes;
DROP POLICY IF EXISTS "Deny all admin_sessions" ON public.admin_sessions;

CREATE POLICY "Deny all admin_users" ON public.admin_users
  FOR ALL TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all admin_login_codes" ON public.admin_login_codes
  FOR ALL TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all admin_sessions" ON public.admin_sessions
  FOR ALL TO public
  USING (false)
  WITH CHECK (false);

-- Exemplo de cadastro de admins.
-- Substitua pelos e-mails reais da equipe.
-- INSERT INTO public.admin_users (email, display_name) VALUES
--   ('admin@cacs.org.br', 'Admin CACS'),
--   ('editor@cacs.org.br', 'Editor CACS')
-- ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name, is_active = true;
