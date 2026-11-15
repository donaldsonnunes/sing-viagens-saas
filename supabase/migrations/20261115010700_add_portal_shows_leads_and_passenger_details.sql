-- Migration Oficial: Shows em Destaque, Alertas de Preço (Leads) e Passageiros Detalhados no Checkout
-- Projeto ID: lbbjgxvbjbsoaglsccun

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS passengers_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payer_cpf text DEFAULT '';

CREATE TABLE IF NOT EXISTS public.featured_shows (
  id text PRIMARY KEY,
  title text NOT NULL,
  artist_or_tour text NOT NULL,
  venue_name text NOT NULL,
  city text NOT NULL,
  destination_iata text NOT NULL,
  event_date_label text NOT NULL,
  suggested_departure_date text NOT NULL,
  suggested_return_date text NOT NULL,
  category_badge text NOT NULL DEFAULT 'Turnê Internacional',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_alerts (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  customer_email text NOT NULL DEFAULT '',
  show_or_event_name text NOT NULL,
  origin_iata text NOT NULL,
  destination_iata text NOT NULL,
  target_month_or_date text NOT NULL,
  status text NOT NULL DEFAULT 'NOVO',
  created_at timestamptz NOT NULL DEFAULT now()
);
