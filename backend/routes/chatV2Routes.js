const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiService');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');
const { createRetrievalPlan } = require('../services/retrievalPlanner');
const { retrieveEvidence } = require('../services/evidenceRetrievalService');
const { assessEvidenceSufficiency } = require('../services/evidenceSufficiencyService');
const { composeEvidenceAnswer } = require('../services/clinicalAnswerComposer');
const { createAbstentionResponse, buildResponseContract } = require('../models/responseContracts');
const { logEvent } = require('../services/structuredLogger');

// Pure greetings carry no clinical question; running them through evidence
// retrieval produces irrelevant registry noise (spec §34: don't dress
// conversation as evidence-grounded clinical guidance).
const GREETING_PATTERN = /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening)|سلام|اهلا|أهلا|هاي)[!.,\s]*$/i;

function buildEvidenceContext(evidence) {
    return evidence.map((item, index) => `[SOURCE ${index + 1} | id=${item.id} | title=${item.title} | url=${item.url || ''}]\n${item.excerpt || item.content}\n[END SOURCE ${index + 1}]`).join('\n\n');
}

function buildComposerPrompt(query, evidenceContext) {
    return `You are the Med Arena clinical composer. The supplied evidence is authoritative context for this response. Use only facts supported by the supplied evidence for material clinical claims. Never invent citations or claim a source was checked unless it appears below. If evidence is insufficient, state the limitation. If evidence conflicts, report the conflict. Preserve structured patient context. Match the user's language. Keep the answer natural. Do not emit UI control markup. Return only the answer prose.\n\nINTERPRETED QUERY:\n${JSON.stringify(query)}\n\nRETRIEVED EVIDENCE:\n${evidenceContext}`;
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
        const plan = createRetrievalPlan(query, {});
        logEvent(requestId, 'retrieval_started', { intent: query.intent, source_count: plan.plans.length, max_rounds: plan.max_rounds });
        let retrieval;
        try {
            retrieval = await retrieveEvidence(plan, query);
        } catch (error) {
            logEvent(requestId, 'retrieval_failed', { code: error.code, source_failures: error.cause });
            return res.json(createAbstentionResponse({ status: 'SYSTEM_FAILURE', queryMetadata: query, limitations: ['evidence_source_unavailable'] }));
        }
        const sufficiency = assessEvidenceSufficiency(retrieval.selected, query, { systemFailure: false, conflicts: [] });
        logEvent(requestId, 'sufficiency_assessed', { status: sufficiency.status, candidate_count: retrieval.candidates.length, selected_count: retrieval.selected.length, failures: retrieval.failures.length });
        if (['NO_EVIDENCE', 'OUTDATED', 'SYSTEM_FAILURE'].includes(sufficiency.status)) return res.json(createAbstentionResponse({ status: sufficiency.status, queryMetadata: query, limitations: sufficiency.missing }));
        const evidenceContext = buildEvidenceContext(retrieval.selected);
        let draft;
        try {
            draft = await callAI(buildComposerPrompt(query, evidenceContext), message, history);
        } catch (error) {
            logEvent(requestId, 'model_failed', { code: 'MODEL_FAILURE' });
            return res.json(createAbstentionResponse({ status: 'SYSTEM_FAILURE', queryMetadata: query, limitations: ['model_provider_unavailable'] }));
        }
        const response = composeEvidenceAnswer({ query, evidence: retrieval.selected, sufficiency, conflicts: [], limitations: retrieval.failures.map((failure) => `${failure.source_id}:${failure.code}`), draftText: draft, provider: 'backend' });
        logEvent(requestId, 'claim_verification_completed', { claims: response.claims.length, sources: response.sources.length, status: response.evidence.status });
        return res.json({ ...response, request_id: requestId });
    } catch (error) {
        logEvent(requestId, 'request_error', { code: error.code || 'VALIDATION_FAILURE' });
        return res.status(400).json({ error: error.message, code: error.code || 'VALIDATION_FAILURE', request_id: requestId });
    }
});

module.exports = router;
