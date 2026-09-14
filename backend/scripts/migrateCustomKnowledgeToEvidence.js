// Milestone 3 (spec §10/§55/§56/§57): normalize curated custom_knowledge rows
// into the V2 evidence tables with source lineage, quality gates, and
// idempotency by content hash. Requires migrations/003 to be applied first.
// Usage: cd backend && node scripts/migrateCustomKnowledgeToEvidence.js
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { generateEmbedding } = require('../services/knowledgeService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function contentHash(text) {
    return crypto.createHash('sha256').update(String(text || '')).digest('hex');
}

// Spec §56 ingestion quality gates.
function passesGates(row) {
    return Boolean(row.title && row.content && String(row.content).trim().length > 0 && (row.source_url || row.guideline_society));
}

(async () => {
    const { data: rows, error } = await supabase.from('custom_knowledge').select('*').eq('is_active', true);
    if (error) {
        console.error('Failed to read custom_knowledge:', error.message);
        process.exit(1);
    }
    console.log(`Loaded ${rows.length} active custom_knowledge rows.`);

    const { data: sources } = await supabase.from('evidence_sources').select('id, source_key');
    const internalSource = (sources || []).find((s) => s.source_key === 'internal_knowledge');
    if (!internalSource) {
        console.error('internal_knowledge source missing — apply migrations/003_evidence_engine_v2.sql first.');
        process.exit(1);
    }

    // Group rows into documents by title (+ society/year) to preserve lineage.
    const groups = new Map();
    for (const row of rows) {
        if (!passesGates(row)) {
            console.warn(`GATE FAIL: skipping "${(row.title || '').slice(0, 60)}"`);
            continue;
        }
        const key = `${row.title}|${row.guideline_society || ''}|${row.publication_year || ''}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
    }
    console.log(`Grouped into ${groups.size} candidate documents.`);

    let documentsCreated = 0;
    let chunksCreated = 0;
    for (const [key, groupRows] of groups) {
        const first = groupRows[0];
        const docHash = contentHash(groupRows.map((r) => r.content).join('\n'));
        // Idempotency: skip when a document with the same content hash exists.
        const { data: existing } = await supabase
            .from('evidence_documents')
            .select('id')
            .eq('content_hash', docHash)
            .limit(1);
        if (existing && existing.length) {
            console.log(`SKIP (hash exists): ${first.title.slice(0, 60)}`);
            continue;
        }

        const { data: document, error: docError } = await supabase
            .from('evidence_documents')
            .insert({
                source_id: internalSource.id,
                title: first.title,
                document_type: 'guideline',
                version_tag: first.version_tag || `${first.guideline_society || 'MED_ARENA'} ${first.publication_year || new Date().getFullYear()}`,
                publication_date: first.publication_year ? `${first.publication_year}-01-01` : null,
                document_status: 'CURRENT',
                is_current: true,
                canonical_url: first.source_url || null,
                pmid: first.pmid || null,
                content_hash: docHash,
                raw_metadata: { migrated_from: 'custom_knowledge', guideline_society: first.guideline_society || null },
            })
            .select('id')
            .single();
        if (docError || !document) {
            console.error(`Document insert failed for "${first.title.slice(0, 60)}":`, docError?.message);
            continue;
        }
        documentsCreated++;

        for (let i = 0; i < groupRows.length; i++) {
            const row = groupRows[i];
            const { data: section, error: sectionError } = await supabase
                .from('evidence_sections')
                .insert({ document_id: document.id, heading: `chunk_${i + 1}`, section_path: `${first.title}/${i + 1}`, sequence_number: i, text: row.content })
                .select('id')
                .single();
            if (sectionError || !section) {
                console.error(`Section insert failed:`, sectionError?.message);
                continue;
            }
            const embedding = await generateEmbedding(row.content);
            if (!embedding) {
                console.warn(`Embedding failed for chunk ${i + 1} of "${first.title.slice(0, 60)}" — section kept without chunk.`);
                continue;
            }
            const { error: chunkError } = await supabase
                .from('evidence_chunks')
                .insert({
                    document_id: document.id,
                    section_id: section.id,
                    content: row.content,
                    lexical_text: row.content.toLowerCase(),
                    embedding,
                    chunk_type: 'evidence_summary',
                    token_count: Math.ceil(String(row.content).length / 4),
                });
            if (chunkError) console.error(`Chunk insert failed:`, chunkError.message);
            else chunksCreated++;
        }
    }

    console.log(`\nDone. documents_created=${documentsCreated} chunks_created=${chunksCreated}`);
})();
