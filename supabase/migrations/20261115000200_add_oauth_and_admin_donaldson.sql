-- Migration Oficial: Login Social (Google / Apple ID) e Administrador Master (donaldson.nunes@gmail.com)
-- Projeto ID: lbbjgxvbjbsoaglsccun

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'EMAIL',
  ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO public.users (id, name, email, password_hash, phone, role, auth_provider, created_at)
VALUES (
  'usr-donaldson-admin',
  'Donaldson Nunes',
  'donaldson.nunes@gmail.com',
  'sing2026',
  '(11) 99999-0000',
  'ADMIN',
  'GOOGLE',
  now()
)
ON CONFLICT (email) DO UPDATE
SET role = 'ADMIN',
    name = COALESCE(NULLIF(public.users.name, ''), 'Donaldson Nunes');

CREATE OR REPLACE FUNCTION public.enforce_super_admin_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF lower(NEW.email) IN ('donaldson.nunes@gmail.com', 'admin@singviagens.com.br') THEN
    NEW.role := 'ADMIN';
  END IF;
  RETURN NEW;
END;
$$;
