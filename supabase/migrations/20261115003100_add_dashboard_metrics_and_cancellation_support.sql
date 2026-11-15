-- Migration Oficial: Suporte a Métricas de Dashboard (Custo Milhas, Lucro Sing e Cancelamentos)
-- Projeto ID: lbbjgxvbjbsoaglsccun

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS miles_cost_total numeric(12,2) NOT NULL DEFAULT 1000.00,
  ADD COLUMN IF NOT EXISTS sing_profit_amount numeric(12,2) NOT NULL DEFAULT 250.00,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text;
