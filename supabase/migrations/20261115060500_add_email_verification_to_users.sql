-- Migration: Add Email Verification Columns to Users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_code text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_at timestamptz;

UPDATE public.users
SET
  email_verified = true,
  verified_at = COALESCE(verified_at, now())
WHERE lower(email) IN (
  'donaldson.nunes@gmail.com',
  'admin@singviagens.com.br',
  'cliente@singviagens.com.br'
) OR auth_provider IN ('GOOGLE', 'APPLE');
