const { createAbstentionResponse, buildResponseContract } = require('../models/responseContracts');
const { extractMaterialClaims } = require('./claimExtractionService');
const { verifyClaims, verifyClaimsHybrid } = require('./claimVerificationService');

// Composer drafts occasionally echo the prompt's evidence-context markers
// ([SOURCE 2 | ...], [END SOURCE 2]). They are prompt artifacts, never answer
// content, and must not survive into the response: a stripped draft once left
// "[END SOURCE 2] 1.4]" as the whole VERIFIED answer (production, 2026-10-03).
const CONTEXT_MARKER_PATTERN = /\[\s*(?:END\s+)?SOURCE\s*\d+[^\]]*\]/gi;

function sanitizeComposerDraft(text) {
    const cleaned = String(text || '')
        .replace(CONTEXT_MARKER_PATTERN, ' ')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    const paragraphs = cleaned.split(/\n\s*\n/);
    const seen = new Set();
    const uniqueParas = [];
    for (const p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) continue;
        if (!seen.has(trimmed)) {
            seen.add(trimmed);
            uniqueParas.push(trimmed);
        }
    }
    return uniqueParas.join('\n\n');
}

// A usable answer carries real prose; marker residue, stray numbers and empty
// strings do not. Counting letters (Latin or Arabic) keeps the check
// language-independent.
function isUsableComposerText(text) {
    const value = String(text || '').trim();
    const letters = (value.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
    return letters >= 20;
}

function buildEvidenceSource(item) {
    if (!item.id || !item.title || !(item.url || item.pmid || item.doi)) return null;
    return { id: item.id, source_type: item.source_type || item.sourceType || 'unknown', organization: item.organization || item.authority_source || null, title: item.title, version: item.version_tag || item.version || null, publication_date: item.publication_date || item.year || null, retrieved_at: item.retrieved_at || new Date().toISOString(), url: item.url || null, pmid: item.pmid || null, doi: item.doi || null, excerpt: item.excerpt || item.content || '', evidence_depth: item.evidence_depth || 'abstract', freshness: item.freshness || 'unknown' };
}

// Spec §4: natural language stays in text; distinct parts additionally land in
// structured sections parsed from the draft's "### Heading" markdown lines.
function parseDraftSections(draftText) {
    const text = String(draftText || '');
    const matches = [...text.matchAll(/^###\s+(.+)$/gm)];
    if (matches.length < 2) return [];
    const sections = [];
    for (let i = 0; i < matches.length; i++) {
        const title = matches[i][1].trim();
        const start = matches[i].index + matches[i][0].length;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const body = text.slice(start, end).trim();
        if (title && body) sections.push({ id: `section_${sections.length + 1}`, title, text: body });
    }
    return sections;
}

// Spec §0.5 (pipeline fix): unsupported material claims are REMOVED from the
// draft before the final response — never kept with an appended disclaimer.
// Sentences are removed by exact matching against the unsupported claim text.
function stripUnsupportedClaims(draftText, claims) {
    let text = String(draftText || '');
    const unsupported = claims.filter((claim) => claim.support_level === 'UNSUPPORTED');
    for (const claim of unsupported) {
        if (!claim.text) continue;
        const escaped = claim.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Remove the sentence plus surrounding whitespace/newline.
        text = text.replace(new RegExp(`\\s*${escaped}\\s*`), '\n');
    }
    // Clean up artifacts from removals.
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return { text, removedCount: unsupported.length };
}

async function composeEvidenceAnswer({ query, evidence = [], sufficiency, conflicts = [], limitations = [], draftText, provider, sessionState, coverage = [] }) {
    if (!sufficiency || ['NO_EVIDENCE', 'NO_RELEVANT_EVIDENCE', 'SOURCE_UNAVAILABLE', 'SYSTEM_FAILURE', 'OUTDATED'].includes(sufficiency.status)) {
        return createAbstentionResponse({ status: sufficiency.status || 'NO_RELEVANT_EVIDENCE', queryMetadata: query, limitations: sufficiency.missing || limitations });
    }
    const sources = evidence.map(buildEvidenceSource).filter(Boolean);
    const sanitizedDraft = sanitizeComposerDraft(draftText);
    // Numerical/query context feeds the numeric-consistency check (spec §29):
    // numbers stated by the user are legitimate answer material.
    const queryContextText = [query.raw_query, JSON.stringify(query.clinical_measurements || {}), JSON.stringify(query.patient || {})].join(' ');
    // Hybrid verification (spec §25): token overlap + semantic similarity.
    const { claims: verifiedClaims, diagnostics: verificationDiagnostics } = await verifyClaimsHybrid(extractMaterialClaims(sanitizedDraft), evidence, conflicts, queryContextText);
    const { text: cleanedDraft, removedCount } = stripUnsupportedClaims(sanitizedDraft, verifiedClaims);
    const claims = verifiedClaims.filter((claim) => claim.support_level !== 'UNSUPPORTED');
    const unsupportedLimitation = removedCount > 0 ? 'unverified_claims_removed_from_answer' : null;
    const finalText = sanitizeComposerDraft(cleanedDraft);
    // Spec §0.5/§33: if stripping left no usable prose (or only echoed prompt
    // markers), report an honest retryable failure — never ship the residue as
    // a VERIFIED answer, and never fall back to model memory.
    if (!isUsableComposerText(finalText)) {
        return buildResponseContract({
            answer: {
                type: query.intent || 'clinical_guidance',
                text: 'The clinical answer could not be composed from the retrieved evidence. No unverified answer was generated. Please retry.',
                sections: [],
            },
            evidence: {
                status: 'SYSTEM_FAILURE',
                checked_at: new Date().toISOString(),
                freshness: 'unknown',
                sufficiency_score: sufficiency.score,
                retryable: true,
            },
            limitations: [...limitations, 'composer_output_invalid'],
            query_metadata: { ...query, provider: provider || null, patient_context: sessionState || null, coverage, verification: verificationDiagnostics },
        });
    }
    const partialCoverage = coverage.some((entry) => entry.coverage === 'partially_supported' || entry.coverage === 'unsupported');
    const status = sufficiency.status === 'VERIFIED' && partialCoverage ? 'PARTIAL' : sufficiency.status;
    return buildResponseContract({
        answer: { type: query.intent || 'clinical_guidance', text: finalText, sections: parseDraftSections(finalText) },
        evidence: {
            ...sufficiency,
            checked_at: new Date().toISOString(),
            freshness: sufficiency.status === 'VERIFIED' ? 'current' : 'mixed',
            sources_used: sources.length,
            primary_source_id: sources[0]?.id || null,
            sufficiency_score: sufficiency.score,
        },
        claims,
        sources,
        conflicts,
        limitations: [
            ...limitations,
            ...(unsupportedLimitation ? [unsupportedLimitation] : []),
            ...(partialCoverage ? ['some_sub_questions_not_covered_by_retrieved_evidence'] : []),
            ...(provider ? [] : ['model_provider_not_recorded']),
        ].filter(Boolean),
        query_metadata: { ...query, provider: provider || null, patient_context: sessionState || null, coverage, verification: verificationDiagnostics },
    });
}

module.exports = { composeEvidenceAnswer, stripUnsupportedClaims };
