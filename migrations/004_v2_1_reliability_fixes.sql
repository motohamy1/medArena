-- V2.1 reliability fixes (spec MEDARENA_EVIDENCE_ENGINE_V2.1)
-- Non-destructive: additive columns + idempotent seed rows only.

-- 1. knowledge_gaps.context drift (spec §58 / migration 002 gap):
--    chatV2Routes.recordKnowledgeGap() inserts a `context` JSON payload but
--    migration 002 never defined the column, so those inserts failed silently.
ALTER TABLE knowledge_gaps
    ADD COLUMN IF NOT EXISTS context JSONB;

-- 2. Missing internal_knowledge source seed (migration 003 gap):
--    evidenceRetrievalService tags pgvector hits source_id='internal_knowledge'
--    and migrateCustomKnowledgeToEvidence.js requires this row to exist.
INSERT INTO evidence_sources (source_key, organization, source_type, authority_tier, authority_score, jurisdiction, capabilities, canonical_url, enabled)
VALUES (
    'internal_knowledge',
    'Med Arena Editorial',
    'guideline',
    1,
    1.0,
    ARRAY['international']::text[],
    ARRAY['guideline', 'recommendation', 'internal_reviewed']::text[],
    NULL,
    true
)
ON CONFLICT (source_key) DO NOTHING;
