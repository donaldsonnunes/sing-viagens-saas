-- Migration: Add Passenger Profile Fields to Users and Replicate on Registration
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cpf text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passport text NOT NULL DEFAULT '';

UPDATE public.users
SET
  first_name = 'Donaldson',
  last_name = 'Nunes',
  birth_date = '1985-04-12',
  cpf = '284.910.378-00',
  passport = 'FP892341'
WHERE lower(email) = 'donaldson.nunes@gmail.com' AND first_name = '';

UPDATE public.users
SET
  first_name = 'Mariana',
  last_name = 'Costa',
  birth_date = '1992-08-19',
  cpf = '391.482.108-45'
WHERE lower(email) = 'cliente@singviagens.com.br' AND first_name = '';
