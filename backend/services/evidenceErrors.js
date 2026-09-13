const ERROR_CODES = Object.freeze({
    QUERY_PARSE_ERROR: 'QUERY_PARSE_ERROR',
    RETRIEVAL_TIMEOUT: 'RETRIEVAL_TIMEOUT',
    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
    RATE_LIMITED: 'RATE_LIMITED',
    NO_RELEVANT_EVIDENCE: 'NO_RELEVANT_EVIDENCE',
    INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE',
    CONFLICTING_EVIDENCE: 'CONFLICTING_EVIDENCE',
    MODEL_FAILURE: 'MODEL_FAILURE',
    VALIDATION_FAILURE: 'VALIDATION_FAILURE',
    DATABASE_FAILURE: 'DATABASE_FAILURE',
});

function createEvidenceError(code, message, cause) {
    const error = new Error(message);
    error.code = code;
    error.cause = cause;
    return error;
}

module.exports = { ERROR_CODES, createEvidenceError };
