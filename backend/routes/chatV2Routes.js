const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
const { callAI } = require('../services/aiService');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');
const { createRetrievalPlan } = require('../services/retrievalPlanner');
const { retrieveEvidence } = require('../services/evidenceRetrievalService');
const { assessEvidenceSufficiency } = require('../services/evidenceSufficiencyService');
const { composeEvidenceAnswer } = require('../services/clinicalAnswerComposer');
const { createAbstentionResponse, buildResponseContract } = require('../models/responseContracts');
const { logEvent } = require('../services/structuredLogger');
const { extractSessionClinicalState } = require('../services/sessionClinicalState');

// Pure greetings carry no clinical question; running them through evidence
// retrieval produces irrelevant registry noise (spec §34: don't dress
// conversation as evidence-grounded clinical guidance).
const GREETING_PATTERN = /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening)|سلام|اهلا|أهلا|هاي)[!.,\s]*$/i;

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    : null;

// Spec §29: response shape is determined by intent + complexity.
function composerPolicy(query, sessionState) {
    switch (query.intent) {
        case 'drug_question':
            return 'This is a dosing/drug question: lead with the direct answer (drug, dose, route, frequency, duration), then key cautions in 1-2 sentences. Do not force clinical assessment headings.';
        case 'follow_up':
            return 'This is a follow-up: continue the existing conversation naturally. Do not restart with generic headings; resolve references against the established clinical context.';
        case 'research_question':
        case 'latest_evidence':
            return 'This is an evidence-synthesis request: organize as a brief synthesis with a short evidence-landscape summary, then key findings, then stated uncertainty.';
        case 'diagnosis_question':
            return 'This is a diagnostic/workup question: reason-oriented workup (criteria, then tests, then differentials supported by evidence).';
        default:
            return 'This is a clinical management question: lead with the primary recommendation supported by evidence, then important qualifiers, alternatives only if evidence states them, and conflicts if present.';
    }
}

function buildEvidenceContext(evidence) {
    return evidence.map((item, index) => `[SOURCE ${index + 1} | id=${item.id} | title=${item.title} | url=${item.url || ''}]\n${item.excerpt || item.content}\n[END SOURCE ${index + 1}]`).join('\n\n');
}

// Spec §53 prompt contract. Spec §28: use only sections that materially help;
// the model may use "### Heading" markdown for multi-part answers, which the
// composer parses into the structured sections field.
function buildComposerPrompt(query, evidenceContext, sessionState) {
    return `You are the Med Arena clinical composer. The supplied evidence is authoritative context for this response. Use only facts supported by the supplied evidence for material clinical claims. Never invent citations or claim a source was checked unless it appears below. If evidence is insufficient, state the limitation. If evidence conflicts, report the conflict. Preserve structured patient context. Match the user's language. Keep the answer natural. Do not emit UI control markup other than optional "### Heading" lines for distinct sections. Return only the answer prose.\n\nRESPONSE POLICY: ${composerPolicy(query, sessionState)}\n\nPATIENT CONTEXT (from stated information only): ${JSON.stringify(sessionState)}\n\nINTERPRETED QUERY:\n${JSON.stringify(query)}\n\nRETRIEVED EVIDENCE:\n${evidenceContext}`;
}

function dedupeById(items) {
    const seen = new Set();
    const merged = [];
    for (const item of items || []) {
        if (!item || !item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
    }
    return merged;
}

// Spec V2.1 §0.8/A.3: the model call is bounded. A hung provider must not
// stall the request indefinitely; it becomes MODEL_FAILURE (an abstention,
// never a memory fallback).
const COMPOSER_TIMEOUT_MS = Number(process.env.COMPOSER_TIMEOUT_MS || 30000);

function withModelTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            const error = new Error(`Composer model exceeded ${ms}ms timeout`);
            error.code = 'MODEL_FAILURE';
            reject(error);
        }, ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Spec §58: record the unanswered question for the scientist/review loop.
// Never block the response on this; gaps are advisory.
async function recordKnowledgeGap(message, query, requestId) {
    if (!supabase) return;
    try {
        await supabase.from('knowledge_gaps').insert({ query: String(message).slice(0, 500), category: query.intent || 'clinical_management', context: JSON.stringify({ language: query.language, search_terms: query.search_terms }), status: 'PENDING' });
        logEvent(requestId, 'knowledge_gap_recorded', {});
    } catch (error) {
        logEvent(requestId, 'knowledge_gap_record_failed', { message: error.message });
    }
}

router.post('/', async (req, res) => {
    const requestId = req.requestId || `req_${Date.now()}`;
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required', code: 'QUERY_PARSE_ERROR', request_id: requestId });
    if (GREETING_PATTERN.test(String(message).trim())) {
        return res.json(buildResponseContract({
            answer: { type: 'conversation', text: 'Hello! How can I help you with a clinical question today?', sections: [] },
            evidence: { status: 'PARTIAL', freshness: 'current', sufficiency_score: null },
            query_metadata: { intent: 'conversation' },
        }));
    }
    try {
        logEvent(requestId, 'interpretation_started');
        const query = interpretClinicalQuery(message, history);
        const sessionState = extractSessionClinicalState(history, message);
        const plan = createRetrievalPlan(query, sessionState);
        logEvent(requestId, 'retrieval_started', { intent: query.intent, source_count: plan.plans.length, max_rounds: plan.max_rounds });
        let retrieval;
        try {
            retrieval = await retrieveEvidence(plan, query);
        } catch (error) {
            logEvent(requestId, 'retrieval_failed', { code: error.code, source_failures: error.cause });
            return res.json(createAbstentionResponse({ status: 'SYSTEM_FAILURE', queryMetadata: query, limitations: ['evidence_source_unavailable'] }));
        }
        let sufficiency = assessEvidenceSufficiency(retrieval.selected, query, { systemFailure: false, conflicts: [] });
        // Spec V2.1-P observability: record per-source health on every request.
        logEvent(requestId, 'source_health', { sources: retrieval.sourceHealth });
        logEvent(requestId, 'sufficiency_assessed', { status: sufficiency.status, candidate_count: retrieval.candidates.length, selected_count: retrieval.selected.length, failures: retrieval.failures.length, missing: sufficiency.missing });

        // Spec §25 bounded recursive retrieval: one sufficiency-driven round
        // only when the system cannot answer at all (PARTIAL is sufficient to
        // compose an answer; recursing on it doubles latency for no gain).
        if (['NO_EVIDENCE', 'OUTDATED'].includes(sufficiency.status) && plan.max_rounds > 1) {
            logEvent(requestId, 'retrieval_round_2_started', { reason: sufficiency.missing });
            const round2Query = { ...query, temporal_request: sufficiency.missing.includes('current_evidence') ? 'current' : query.temporal_request };
            try {
                const retrieval2 = await retrieveEvidence(plan, round2Query, { forceBroad: true });
                const mergedSelected = dedupeById([...retrieval.selected, ...retrieval2.selected]);
                retrieval = { ...retrieval, selected: mergedSelected, candidates: [...retrieval.candidates, ...retrieval2.candidates] };
                sufficiency = assessEvidenceSufficiency(mergedSelected, query, { systemFailure: false, conflicts: [] });
                logEvent(requestId, 'sufficiency_reassessed', { status: sufficiency.status, selected_count: mergedSelected.length });
            } catch (error) {
                logEvent(requestId, 'retrieval_round_2_failed', { message: error.message });
            }
        }

        if (['NO_EVIDENCE', 'OUTDATED', 'SYSTEM_FAILURE'].includes(sufficiency.status)) {
            if (sufficiency.status === 'NO_EVIDENCE') await recordKnowledgeGap(message, query, requestId);
            return res.json(createAbstentionResponse({ status: sufficiency.status, queryMetadata: query, limitations: sufficiency.missing }));
        }
        const evidenceContext = buildEvidenceContext(retrieval.selected);
        let draft;
        try {
            draft = await withModelTimeout(callAI(buildComposerPrompt(query, evidenceContext, sessionState), message, history), COMPOSER_TIMEOUT_MS);
        } catch (error) {
            logEvent(requestId, 'model_failed', { code: error.code || 'MODEL_FAILURE', message: error.message });
            return res.json(createAbstentionResponse({ status: 'SYSTEM_FAILURE', queryMetadata: query, limitations: ['model_provider_unavailable'] }));
        }
        const response = composeEvidenceAnswer({ query, evidence: retrieval.selected, sufficiency, conflicts: [], limitations: retrieval.failures.map((failure) => `${failure.source_id}:${failure.code}`), draftText: draft, provider: 'backend', sessionState });
        logEvent(requestId, 'claim_verification_completed', { claims: response.claims.length, sources: response.sources.length, status: response.evidence.status });
        return res.json({ ...response, request_id: requestId });
    } catch (error) {
        logEvent(requestId, 'request_error', { code: error.code || 'VALIDATION_FAILURE' });
        return res.status(400).json({ error: error.message, code: error.code || 'VALIDATION_FAILURE', request_id: requestId });
    }
});

module.exports = router;
