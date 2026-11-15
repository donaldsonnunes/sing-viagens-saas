-- Migration: Add Frequent Passengers Table (Unlimited per User Account)
CREATE TABLE IF NOT EXISTS public.frequent_passengers (
  id text PRIMARY KEY,
  user_email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date text NOT NULL,
  cpf text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  passport text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_frequent_passengers_user_email
  ON public.frequent_passengers (lower(user_email), created_at DESC);

ALTER TABLE public.frequent_passengers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'frequent_passengers' AND policyname = 'frequent_passengers_access'
  ) THEN
    CREATE POLICY "frequent_passengers_access" ON public.frequent_passengers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.frequent_passengers TO anon, authenticated;

INSERT INTO public.frequent_passengers (id, user_email, first_name, last_name, birth_date, cpf, email, phone, passport)
VALUES
  ('PAX-DON-1', 'donaldson.nunes@gmail.com', 'Donaldson', 'Nunes', '1985-04-12', '284.910.378-00', 'donaldson.nunes@gmail.com', '(11) 99999-0000', 'FP892341'),
  ('PAX-CLI-1', 'cliente@singviagens.com.br', 'Mariana', 'Costa', '1992-08-19', '391.482.108-45', 'cliente@singviagens.com.br', '(11) 98877-6655', '')
ON CONFLICT (id) DO NOTHING;
