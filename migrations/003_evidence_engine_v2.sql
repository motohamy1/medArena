CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_key TEXT NOT NULL UNIQUE,
    organization TEXT NOT NULL,
    source_type TEXT NOT NULL,
    authority_tier SMALLINT NOT NULL CHECK (authority_tier BETWEEN 1 AND 4),
    authority_score NUMERIC(4,3) NOT NULL CHECK (authority_score BETWEEN 0 AND 1),
    jurisdiction TEXT[] NOT NULL DEFAULT '{}',
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    canonical_url TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES evidence_sources(id),
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    version_tag TEXT,
    publication_date DATE,
    effective_date DATE,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ,
    superseded_at TIMESTAMPTZ,
    document_status TEXT NOT NULL DEFAULT 'UNKNOWN_STATUS' CHECK (document_status IN ('CURRENT', 'SUPERSEDED', 'WITHDRAWN', 'UNKNOWN_STATUS')),
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    supersedes_document_id UUID REFERENCES evidence_documents(id),
    superseded_by_document_id UUID REFERENCES evidence_documents(id),
    canonical_url TEXT,
    doi TEXT,
    pmid TEXT,
    content_hash TEXT,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
    parent_section_id UUID REFERENCES evidence_sections(id),
    heading TEXT,
    section_path TEXT,
    sequence_number INTEGER NOT NULL DEFAULT 0,
    text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
    section_id UUID REFERENCES evidence_sections(id) ON DELETE SET NULL,
    recommendation_text TEXT NOT NULL,
    population TEXT,
    condition TEXT,
    intervention TEXT,
    comparator TEXT,
    outcome TEXT,
    recommendation_strength TEXT,
    evidence_certainty TEXT,
    exceptions TEXT,
    sequence_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS evidence_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
    section_id UUID REFERENCES evidence_sections(id) ON DELETE SET NULL,
    recommendation_id UUID REFERENCES evidence_recommendations(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    lexical_text TEXT NOT NULL,
    embedding vector(3072),
    chunk_type TEXT NOT NULL CHECK (chunk_type IN ('section', 'recommendation', 'definition', 'diagnostic_criterion', 'dosing_block', 'contraindication', 'table_fact', 'evidence_summary', 'reference_block')),
    token_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
    mesh_id TEXT,
    icd_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    arabic_names JSONB NOT NULL DEFAULT '[]'::jsonb,
    egyptian_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
    normalized_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_entity_links (
    evidence_id UUID NOT NULL REFERENCES evidence_chunks(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES clinical_entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    PRIMARY KEY (evidence_id, entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS evidence_documents_current_idx ON evidence_documents (is_current, document_status, effective_date DESC);
CREATE INDEX IF NOT EXISTS evidence_documents_source_idx ON evidence_documents (source_id, publication_date DESC);
CREATE INDEX IF NOT EXISTS evidence_chunks_document_idx ON evidence_chunks (document_id, chunk_type);
CREATE INDEX IF NOT EXISTS evidence_chunks_lexical_idx ON evidence_chunks USING gin (to_tsvector('simple', lexical_text));
CREATE INDEX IF NOT EXISTS clinical_entities_normalized_name_idx ON clinical_entities (normalized_name);

INSERT INTO evidence_sources (source_key, organization, source_type, authority_tier, authority_score, jurisdiction, capabilities, canonical_url)
VALUES
    ('who', 'WHO', 'guideline', 1, 1.000, ARRAY['international'], ARRAY['guideline', 'recommendation', 'surveillance'], 'https://www.who.int/publications/guidelines'),
    ('nice', 'NICE', 'guideline', 1, 1.000, ARRAY['UK', 'international'], ARRAY['guideline', 'recommendation', 'surveillance'], 'https://www.nice.org.uk/guidance'),
    ('cdc', 'CDC', 'guideline', 1, 1.000, ARRAY['US', 'international'], ARRAY['guideline', 'recommendation', 'surveillance'], 'https://www.cdc.gov/guidelines/'),
    ('fda', 'FDA', 'regulatory', 1, 1.000, ARRAY['US'], ARRAY['label', 'warning', 'safety'], 'https://www.fda.gov/drugs'),
    ('ema', 'EMA', 'regulatory', 1, 1.000, ARRAY['EU', 'international'], ARRAY['label', 'warning', 'safety'], 'https://www.ema.europa.eu/en/medicines'),
    ('mhra', 'MHRA', 'regulatory', 1, 1.000, ARRAY['UK'], ARRAY['safety', 'alert'], 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency'),
    ('pubmed', 'NCBI PubMed', 'literature', 2, 0.850, ARRAY['international'], ARRAY['search', 'article_metadata', 'abstract'], 'https://pubmed.ncbi.nlm.nih.gov/'),
    ('europe_pmc', 'Europe PMC', 'literature', 2, 0.850, ARRAY['international'], ARRAY['search', 'article_metadata', 'abstract'], 'https://europepmc.org/'),
    ('clinicaltrials_gov', 'ClinicalTrials.gov', 'trial_registry', 3, 0.700, ARRAY['international'], ARRAY['trial_discovery', 'emerging_evidence'], 'https://clinicaltrials.gov/'),
    ('huggingface_medical_reasoning', 'Hugging Face Medical Reasoning Dataset', 'discovery', 4, 0.100, ARRAY['international'], ARRAY['discovery'], 'https://huggingface.co/datasets/OpenMed/Medical-Reasoning-SFT-Mega')
ON CONFLICT (source_key) DO UPDATE SET
    organization = EXCLUDED.organization,
    source_type = EXCLUDED.source_type,
    authority_tier = EXCLUDED.authority_tier,
    authority_score = EXCLUDED.authority_score,
    jurisdiction = EXCLUDED.jurisdiction,
    capabilities = EXCLUDED.capabilities,
    canonical_url = EXCLUDED.canonical_url,
    updated_at = NOW();
