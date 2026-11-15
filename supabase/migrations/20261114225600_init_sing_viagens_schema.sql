-- Migration Oficial: Estrutura Inicial Sing Viagens SaaS no Supabase (sa-east-1 São Paulo)
-- Projeto ID: lbbjgxvbjbsoaglsccun

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id text PRIMARY KEY DEFAULT 'default',
  profit_share_on_savings_percent numeric(5,2) NOT NULL DEFAULT 50.00,
  mile_cost_per_thousand jsonb NOT NULL DEFAULT '{"LATAM": 24.5, "GOL": 17.5, "AZUL": 21.0, "TAP": 42.0, "AMERICAN": 68.0, "AIRFRANCE": 54.0}'::jsonb,
  fallback_markup_percent numeric(5,2) NOT NULL DEFAULT 10.00,
  fixed_emission_fee_per_passenger numeric(10,2) NOT NULL DEFAULT 0.00,
  child_discount_percent numeric(5,2) NOT NULL DEFAULT 25.00,
  infant_discount_percent numeric(5,2) NOT NULL DEFAULT 85.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));

CREATE TABLE IF NOT EXISTS public.search_history (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  user_email text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date text NOT NULL,
  return_date text,
  trip_type text NOT NULL DEFAULT 'ROUND_TRIP',
  adults integer NOT NULL DEFAULT 1,
  children_ages jsonb NOT NULL DEFAULT '[]'::jsonb,
  cabin_class text NOT NULL DEFAULT 'ECONOMY',
  lowest_sing_price numeric(12,2) NOT NULL,
  lowest_airline_direct_price numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_history_user_email ON public.search_history (lower(user_email), created_at DESC);

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  pnr text NOT NULL,
  user_id text NOT NULL,
  user_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  flight_code text NOT NULL,
  airline text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date text NOT NULL,
  return_date text,
  passengers_summary text NOT NULL,
  sing_total_price numeric(12,2) NOT NULL,
  airline_direct_reference_price numeric(12,2) NOT NULL,
  savings_amount numeric(12,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'PIX',
  status text NOT NULL DEFAULT 'CONFIRMADO',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders (lower(user_email), created_at DESC);

CREATE TABLE IF NOT EXISTS public.external_api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  endpoint text NOT NULL,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  http_status integer,
  latency_ms integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_external_api_logs_provider_created ON public.external_api_logs (provider_name, created_at DESC);
