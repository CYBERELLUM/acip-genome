
-- ============================================
-- FEDERATION SATELLITE SCHEMA v2.0
-- Node: cyberellum-research / wymznknyhbsiqycrsduj
-- ============================================

CREATE TABLE IF NOT EXISTS public.grls_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_key TEXT NOT NULL UNIQUE,
  memory_type TEXT DEFAULT 'general',
  memory_value JSONB,
  domain TEXT,
  summary TEXT,
  signal_strength NUMERIC DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.grls_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grls_memory_all" ON public.grls_memory FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.federation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node TEXT NOT NULL,
  action TEXT NOT NULL,
  validation_passed BOOLEAN DEFAULT true,
  fabrication_detected BOOLEAN DEFAULT false,
  fabrication_patterns JSONB,
  confidence_score NUMERIC,
  recommendation TEXT,
  response_status INTEGER,
  error_message TEXT,
  metadata JSONB,
  payload_hash TEXT,
  payload_preview TEXT,
  processing_time_ms INTEGER,
  priority_violations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.federation_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_all" ON public.federation_audit_log FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.governance_hydration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL,
  phase INTEGER DEFAULT 0,
  phase_name TEXT,
  status TEXT DEFAULT 'pending',
  quality_score NUMERIC,
  error_message TEXT,
  metadata JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.governance_hydration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hydration_log_all" ON public.governance_hydration_log FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.federation_doctrines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node TEXT NOT NULL,
  doctrine_type TEXT DEFAULT 'general',
  title TEXT,
  content JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'received',
  metadata JSONB,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(source_node, doctrine_type)
);
ALTER TABLE public.federation_doctrines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctrines_all" ON public.federation_doctrines FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.federation_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL UNIQUE,
  node_name TEXT NOT NULL,
  node_type TEXT DEFAULT 'satellite',
  tier INTEGER DEFAULT 2,
  endpoint_url TEXT,
  project_id TEXT,
  capabilities JSONB,
  status TEXT DEFAULT 'pending',
  last_heartbeat TIMESTAMPTZ,
  public_key TEXT,
  metadata JSONB,
  ipc_enabled BOOLEAN DEFAULT true,
  link_direction TEXT DEFAULT 'bi',
  max_data_classification TEXT DEFAULT 'restricted',
  interconnect_allowed BOOLEAN DEFAULT true,
  federation_version TEXT DEFAULT '2.0',
  parent_node_id TEXT,
  last_ipc_success TIMESTAMPTZ,
  ipc_failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.federation_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nodes_all" ON public.federation_nodes FOR ALL USING (true);

-- Pre-register the Hub
INSERT INTO public.federation_nodes (
  node_id, node_name, node_type, tier, endpoint_url, project_id,
  capabilities, status, ipc_enabled, link_direction, max_data_classification
) VALUES (
  'quantum-concierge',
  'Quantum Concierge Nexus Hub',
  'hub', 1,
  'https://thbytgrwucglehsnxbzn.supabase.co/functions/v1/federation-receiver',
  'thbytgrwucglehsnxbzn',
  '["governance","pqc","tokenization","dnft","identity","credits","ipc-hub"]'::jsonb,
  'active', true, 'bi', 'blockchain'
) ON CONFLICT (node_id) DO UPDATE SET status = 'active', last_heartbeat = now();

-- Triggers for updated_at (function already exists in this project)
CREATE TRIGGER update_grls_memory_updated_at BEFORE UPDATE ON public.grls_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_federation_nodes_updated_at BEFORE UPDATE ON public.federation_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
