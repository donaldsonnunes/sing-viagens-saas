-- ============================================================================
-- MIGRATION: Inventário Atômico de Trechos & Indexação por Interseção Mensal
-- Objetivo: Minimizar consumo de créditos de API armazenando cada trecho (leg)
-- e o calendário mensal completo (YYYY-MM) de forma desacoplada para permitir
-- reaproveitamento cruzado por interseção de (origin, destination, flight_date).
-- ============================================================================

-- 1. Tabela de Inventário Atômico por Trecho Direcional (Leg-Level Cache)
-- Permite que uma busca Ida+Volta (20/11 e 25/11) seja reaproveitada por outra
-- busca Somente Ida (20/11) ou Ida+Volta com outra data de retorno (20/11 e 28/11).
CREATE TABLE IF NOT EXISTS public.flight_leg_inventory (
  id text PRIMARY KEY, -- Ex: leg_GRU_REC_2026-11-20_latam_ECONOMY
  origin char(3) NOT NULL,
  destination char(3) NOT NULL,
  flight_date date NOT NULL,
  year_month char(7) NOT NULL, -- Ex: '2026-11' para varredura mensal rápida
  provider text NOT NULL,      -- smiles, latam, azul, tarifado, tap, aadvantage, azulpelomundo
  cabin_class text NOT NULL DEFAULT 'ECONOMY',
  lowest_miles integer,
  lowest_tax_brl numeric(10,2),
  lowest_cash_brl numeric(10,2),
  lowest_sing_brl numeric(10,2),
  flights_count integer NOT NULL DEFAULT 0,
  path_airports text[] NOT NULL DEFAULT '{}', -- Ex: '{GRU,BSB,REC}' para busca por interseção de conexões (GIN)
  offers_payload jsonb NOT NULL DEFAULT '[]'::jsonb, -- Lista de voos normalizados e offer_ids
  raw_provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_type text NOT NULL DEFAULT 'APIVIAGENS_LIVE', -- APIVIAGENS_LIVE | MONTHLY_CRAWLER | SYNTHETIC_CURVE
  fetched_at timestamptz NOT NULL DEFAULT now(),
  offer_expires_at timestamptz NOT NULL DEFAULT (now() + interval '50 minutes'),
  cache_expires_at timestamptz NOT NULL DEFAULT (now() + interval '6 hours')
);

-- Índices Compostos B-Tree para Busca Instantânea por Interseção de Rota e Janela de Datas
CREATE INDEX IF NOT EXISTS idx_leg_inventory_route_date_provider
  ON public.flight_leg_inventory (origin, destination, flight_date, provider, cabin_class);

-- Índice para buscar o Mês Inteiro (YYYY-MM) de uma Origem -> Destino em < 2ms
CREATE INDEX IF NOT EXISTS idx_leg_inventory_route_month
  ON public.flight_leg_inventory (origin, destination, year_month, cabin_class);

-- Índice GIN para Interseção de Conexões / Hubs intermediários (complete_path)
CREATE INDEX IF NOT EXISTS idx_leg_inventory_path_airports_gin
  ON public.flight_leg_inventory USING GIN (path_airports);

-- 2. Tabela de Matriz Mensal Pré-Indexada (30/31 dias por par Origem -> Destino)
-- Sempre que uma rota é pesquisada, o mês inteiro é indexado aqui.
CREATE TABLE IF NOT EXISTS public.monthly_fare_calendar (
  id text PRIMARY KEY, -- Ex: cal_GRU_REC_2026-11-20_ECONOMY
  origin char(3) NOT NULL,
  destination char(3) NOT NULL,
  year_month char(7) NOT NULL, -- Ex: '2026-11'
  flight_date date NOT NULL,
  cabin_class text NOT NULL DEFAULT 'ECONOMY',
  lowest_sing_brl numeric(10,2) NOT NULL,
  lowest_airline_cash_brl numeric(10,2) NOT NULL,
  lowest_miles integer NOT NULL,
  best_provider text NOT NULL DEFAULT 'latam',
  is_api_verified boolean NOT NULL DEFAULT false, -- true quando o dia já teve busca real na API
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monthly_calendar_lookup
  ON public.monthly_fare_calendar (origin, destination, year_month, cabin_class, flight_date);

CREATE INDEX IF NOT EXISTS idx_monthly_calendar_date_range
  ON public.monthly_fare_calendar (origin, destination, flight_date, lowest_sing_brl);

-- 3. Função SQL de Interseção de Trechos e Janela Mensal
-- Retorna em uma única query todos os trechos já cacheados (Ida e/ou Volta) + os 30 dias do mês
CREATE OR REPLACE FUNCTION public.query_flight_intersection(
  p_origin char(3),
  p_destination char(3),
  p_departure_date date,
  p_return_date date DEFAULT NULL,
  p_cabin_class text DEFAULT 'ECONOMY'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_outbound_legs jsonb;
  v_inbound_legs jsonb;
  v_monthly_calendar jsonb;
  v_year_month char(7);
BEGIN
  v_year_month := to_char(p_departure_date, 'YYYY-MM');

  -- 1. Busca interseção exata para os trechos de IDA ainda válidos
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_outbound_legs
  FROM public.flight_leg_inventory t
  WHERE t.origin = p_origin
    AND t.destination = p_destination
    AND t.flight_date = p_departure_date
    AND t.cabin_class = p_cabin_class
    AND t.cache_expires_at > now();

  -- 2. Se houver data de VOLTA, busca interseção independente para o trecho de retorno (DESTINO -> ORIGEM)
  IF p_return_date IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_inbound_legs
    FROM public.flight_leg_inventory t
    WHERE t.origin = p_destination
      AND t.destination = p_origin
      AND t.flight_date = p_return_date
      AND t.cabin_class = p_cabin_class
      AND t.cache_expires_at > now();
  ELSE
    v_inbound_legs := '[]'::jsonb;
  END IF;

  -- 3. Busca o calendário mensal completo (YYYY-MM) já armazenado para a rota
  SELECT COALESCE(jsonb_agg(row_to_json(c) ORDER BY c.flight_date ASC), '[]'::jsonb)
  INTO v_monthly_calendar
  FROM public.monthly_fare_calendar c
  WHERE c.origin = p_origin
    AND c.destination = p_destination
    AND c.year_month = v_year_month
    AND c.cabin_class = p_cabin_class;

  RETURN jsonb_build_object(
    'outbound_cached_legs', v_outbound_legs,
    'inbound_cached_legs', v_inbound_legs,
    'monthly_calendar', v_monthly_calendar,
    'year_month', v_year_month
  );
END;
$$;
