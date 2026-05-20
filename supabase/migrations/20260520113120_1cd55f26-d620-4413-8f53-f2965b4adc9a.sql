
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.os_status AS ENUM ('aberta','em_andamento','encerrada','cancelada');
CREATE TYPE public.despesa_categoria AS ENUM ('combustivel','almoco','jantar','pedagio','hospedagem','outras');
CREATE TYPE public.despesa_status AS ENUM ('rascunho','enviado','aprovado','rejeitado');
CREATE TYPE public.hora_tipo AS ENUM ('normal','hora_extra','deslocamento');
CREATE TYPE public.adiantamento_status AS ENUM ('pendente','aprovado','recebido','cancelado');

-- =========================================
-- UTIL: updated_at trigger
-- =========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  matricula TEXT,
  cargo TEXT DEFAULT 'Técnico',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- ORDENS DE SERVICO
-- =========================================
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  cliente TEXT NOT NULL,
  cidade TEXT,
  inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fim_previsto DATE,
  status public.os_status NOT NULL DEFAULT 'aberta',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_os_user ON public.ordens_servico(user_id, created_at DESC);

CREATE POLICY "os_all_own" ON public.ordens_servico FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_os_updated BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- DESPESAS
-- =========================================
CREATE TABLE public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  categoria public.despesa_categoria NOT NULL DEFAULT 'outras',
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.despesa_status NOT NULL DEFAULT 'rascunho',
  estabelecimento TEXT,
  comprovante_url TEXT,
  ocr_dados JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_despesas_user ON public.despesas(user_id, data DESC);

CREATE POLICY "despesas_all_own" ON public.despesas FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_despesas_updated BEFORE UPDATE ON public.despesas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- HORAS TRABALHADAS
-- =========================================
CREATE TABLE public.horas_trabalhadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  inicio TIME NOT NULL,
  fim TIME NOT NULL,
  intervalo_min INT NOT NULL DEFAULT 0,
  tipo public.hora_tipo NOT NULL DEFAULT 'normal',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.horas_trabalhadas ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_horas_user ON public.horas_trabalhadas(user_id, data DESC);

CREATE POLICY "horas_all_own" ON public.horas_trabalhadas FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_horas_updated BEFORE UPDATE ON public.horas_trabalhadas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- ADIANTAMENTOS
-- =========================================
CREATE TABLE public.adiantamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  cliente TEXT,
  periodo TEXT,
  solicitado NUMERIC(10,2) NOT NULL DEFAULT 0,
  recebido NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.adiantamento_status NOT NULL DEFAULT 'pendente',
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adiantamentos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_adiantamentos_user ON public.adiantamentos(user_id, data DESC);

CREATE POLICY "adiantamentos_all_own" ON public.adiantamentos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_adiantamentos_updated BEFORE UPDATE ON public.adiantamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- VALE REFEICAO
-- =========================================
CREATE TABLE public.vale_refeicao_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes_ref DATE NOT NULL,
  valor_diario NUMERIC(10,2) NOT NULL DEFAULT 45,
  saldo_mensal NUMERIC(10,2) NOT NULL DEFAULT 1200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mes_ref)
);
ALTER TABLE public.vale_refeicao_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vr_cfg_all_own" ON public.vale_refeicao_config FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_vr_cfg_updated BEFORE UPDATE ON public.vale_refeicao_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vale_refeicao_uso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vale_refeicao_uso ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_vr_uso_user ON public.vale_refeicao_uso(user_id, data DESC);
CREATE POLICY "vr_uso_all_own" ON public.vale_refeicao_uso FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================
-- RELATORIOS GERADOS
-- =========================================
CREATE TABLE public.relatorios_gerados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'os',
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  periodo_inicio DATE,
  periodo_fim DATE,
  metadados JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.relatorios_gerados ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_relatorios_user ON public.relatorios_gerados(user_id, created_at DESC);
CREATE POLICY "relatorios_all_own" ON public.relatorios_gerados FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================
-- STORAGE: comprovantes
-- =========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes','comprovantes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "comprovantes_select_own" ON storage.objects FOR SELECT
  USING (bucket_id = 'comprovantes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "comprovantes_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comprovantes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "comprovantes_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'comprovantes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "comprovantes_delete_own" ON storage.objects FOR DELETE
  USING (bucket_id = 'comprovantes' AND auth.uid()::text = (storage.foldername(name))[1]);
