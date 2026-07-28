-- =============================================================================
-- MIGRAÇÃO INICIAL — PROJETO JURISTA (Crédito Popular)
-- Cria: leads, clientes, emprestimos, contratos, parcelas + storage + RLS
-- Revisar antes de aplicar em produção.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. LEADS (captação landing page)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    nome_responsavel TEXT,
    nome_comercio TEXT,
    ramo_atividade TEXT,
    email TEXT,
    telefone TEXT NOT NULL,
    valor_solicitado NUMERIC,
    prazo_dias INTEGER,
    chave_pix TEXT,
    tipo_chave_pix TEXT,
    endereco_pessoal TEXT,
    endereco_empresa TEXT,
    endereco_comercial TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    contato1_nome TEXT, contato1_tel TEXT, contato1_relacao TEXT,
    contato2_nome TEXT, contato2_tel TEXT, contato2_relacao TEXT,
    contato3_nome TEXT, contato3_tel TEXT, contato3_relacao TEXT,
    comprovante_url TEXT,
    selfie_url TEXT,
    fachada_url TEXT,
    documento_url TEXT,
    score_interno INTEGER DEFAULT 0,
    prioridade TEXT DEFAULT 'Aguardando',
    status TEXT DEFAULT 'Pendente',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- -----------------------------------------------------------------------------
-- 2. CLIENTES (KYC completo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dados pessoais
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    rg TEXT,
    data_nascimento DATE,
    estado_civil TEXT,
    sexo TEXT,
    nacionalidade TEXT DEFAULT 'Brasileiro(a)',

    -- Contato
    telefone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,

    -- Endereço residencial (jsonb para o objeto EnderecoCompleto)
    endereco_residencial JSONB DEFAULT '{}'::jsonb,
    endereco TEXT, -- legado

    -- Comercial / financeiro
    comercio JSONB DEFAULT '{}'::jsonb,
    financeiro JSONB DEFAULT '{}'::jsonb,

    -- Documentos e referências
    documentos JSONB DEFAULT '[]'::jsonb,
    referencias JSONB DEFAULT '[]'::jsonb,

    observacoes_internas TEXT,

    limite_total NUMERIC DEFAULT 1000,
    limite_disponivel NUMERIC DEFAULT 1000,
    score INTEGER DEFAULT 1000,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo','Bloqueado','Em Análise')),

    foto_url TEXT,
    logo_url TEXT,

    cadastro_completo BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- -----------------------------------------------------------------------------
-- 3. EMPRESTIMOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emprestimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    cliente_nome TEXT NOT NULL,
    valor_principal NUMERIC NOT NULL,
    valor_total_devido NUMERIC NOT NULL,
    qtde_parcelas INTEGER NOT NULL,
    valor_parcela NUMERIC NOT NULL,
    dias_cobranca TEXT DEFAULT 'seg-sex',
    data_inicio DATE NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','quitado','inadimplente','cancelado','renegociado')),
    frequencia TEXT CHECK (frequencia IN ('diario','semanal','quinzenal','mensal')),
    taxa_juros NUMERIC,
    modo_juros SMALLINT CHECK (modo_juros IN (1,2,3)),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_emprestimos_cliente ON emprestimos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_status ON emprestimos(status);

-- -----------------------------------------------------------------------------
-- 4. CONTRATOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    cliente_nome TEXT NOT NULL,
    emprestimo_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
    valor_principal NUMERIC NOT NULL,
    valor_total NUMERIC NOT NULL,
    taxa_porcentagem NUMERIC,
    prazo_parcelas INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_vencimento_final DATE NOT NULL,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo','Quitado','Em Atraso','Cancelado','Renegociado')),
    anexos JSONB DEFAULT '[]'::jsonb,
    observacoes JSONB DEFAULT '[]'::jsonb,
    historico_auditoria JSONB DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_emprestimo ON contratos(emprestimo_id);

-- -----------------------------------------------------------------------------
-- 5. PARCELAS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emprestimo_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    cliente_nome TEXT NOT NULL,
    cliente_tel TEXT,
    numero_parcela INTEGER NOT NULL,
    valor_esperado NUMERIC NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','paga','atrasada','cancelada','renegociada')),
    valor_pago NUMERIC,
    data_pagamento DATE,
    multa_aplicada BOOLEAN DEFAULT false,
    valor_multa NUMERIC,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parcelas_emprestimo ON parcelas(emprestimo_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas(data_vencimento);

-- -----------------------------------------------------------------------------
-- 6. TRIGGER genérico para atualizado_em
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_atualizado_em ON leads;
CREATE TRIGGER trg_leads_atualizado_em BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS trg_clientes_atualizado_em ON clientes;
CREATE TRIGGER trg_clientes_atualizado_em BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- -----------------------------------------------------------------------------
-- 7. STORAGE — bucket documentos
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. RLS
-- ATENÇÃO: policies abaixo são para MVP com painel admin protegido só no
-- front-end (inseguro). Ideal é restringir INSERT/UPDATE/DELETE a role
-- autenticada (auth.uid()) assim que o login real (Supabase Auth) existir.
-- -----------------------------------------------------------------------------
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

-- Leads: público pode inserir (landing page) e ler o próprio (MVP: leitura pública)
DROP POLICY IF EXISTS "leads_insert_publico" ON leads;
CREATE POLICY "leads_insert_publico" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "leads_select_publico" ON leads;
CREATE POLICY "leads_select_publico" ON leads FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "leads_update_authenticated" ON leads;
CREATE POLICY "leads_update_authenticated" ON leads FOR UPDATE TO authenticated USING (true);

-- Clientes/Emprestimos/Contratos/Parcelas: apenas usuários autenticados (painel admin)
DROP POLICY IF EXISTS "clientes_all_authenticated" ON clientes;
CREATE POLICY "clientes_all_authenticated" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "emprestimos_all_authenticated" ON emprestimos;
CREATE POLICY "emprestimos_all_authenticated" ON emprestimos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contratos_all_authenticated" ON contratos;
CREATE POLICY "contratos_all_authenticated" ON contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "parcelas_all_authenticated" ON parcelas;
CREATE POLICY "parcelas_all_authenticated" ON parcelas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage: upload público de documentos (MVP)
DROP POLICY IF EXISTS "documentos_upload_publico" ON storage.objects;
CREATE POLICY "documentos_upload_publico" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'documentos');

DROP POLICY IF EXISTS "documentos_leitura_publica" ON storage.objects;
CREATE POLICY "documentos_leitura_publica" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'documentos');
