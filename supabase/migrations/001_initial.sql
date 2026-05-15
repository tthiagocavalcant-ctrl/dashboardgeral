-- =============================================
-- Dashboard de Monitoramento de Anúncios
-- Migration inicial
-- =============================================

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  company     TEXT        NOT NULL,
  niche       TEXT,
  result_type TEXT        NOT NULL DEFAULT 'lead',
  ad_account_id TEXT      NOT NULL,
  access_token  TEXT      NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de limites de métricas por cliente
CREATE TABLE IF NOT EXISTS public.metric_limits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  metric      TEXT        NOT NULL,  -- 'cpl' | 'ctr' | 'cpc' | 'cpm' | 'spend'
  max_value   NUMERIC,
  min_value   NUMERIC,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, metric)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_metric_limits_client_id ON public.metric_limits(client_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- Para uso autenticado, descomente as policies abaixo
-- e configure autenticação no Supabase Dashboard.
-- Para uso interno sem autenticação, mantenha RLS desabilitado.
-- =============================================

-- Para habilitar RLS (recomendado em produção):
-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.metric_limits ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow all for authenticated users" ON public.clients
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Allow all for authenticated users" ON public.metric_limits
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);
--
-- Para acesso anônimo (desenvolvimento local):
-- CREATE POLICY "Allow all for anon" ON public.clients
--   FOR ALL TO anon USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Allow all for anon" ON public.metric_limits
--   FOR ALL TO anon USING (true) WITH CHECK (true);

-- Grant permissions for anon role (development)
GRANT ALL ON public.clients TO anon;
GRANT ALL ON public.metric_limits TO anon;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.metric_limits TO authenticated;
