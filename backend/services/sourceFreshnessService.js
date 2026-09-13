const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function assessFreshness(document, request = {}) {
    const now = parseDate(request.checkedAt) || new Date();
    const publicationDate = parseDate(document.publication_date || document.publicationDate);
    const effectiveDate = parseDate(document.effective_date || document.effectiveDate);
    const lastCheckedAt = parseDate(document.last_checked_at || document.lastCheckedAt);
    const isCurrent = document.is_current === true || document.document_status === 'CURRENT';
    const isSuperseded = document.superseded_at || document.document_status === 'SUPERSEDED' || document.document_status === 'WITHDRAWN';
    if (isSuperseded) return { status: 'OUTDATED', score: 0, is_current: false, reason: 'document_superseded_or_withdrawn' };
    if (request.requireCurrent && !isCurrent) return { status: 'OUTDATED', score: 0.25, is_current: false, reason: 'current_status_not_confirmed' };
    const relevantDate = effectiveDate || publicationDate;
    const ageDays = relevantDate ? Math.max(0, (now - relevantDate) / DAY_MS) : null;
    const score = isCurrent ? 1 : ageDays === null ? 0.4 : Math.max(0.2, 1 - ageDays / (365 * 5));
    return { status: isCurrent ? 'CURRENT' : 'UNKNOWN_STATUS', score: Number(score.toFixed(4)), is_current: isCurrent, age_days: ageDays, last_checked_at: lastCheckedAt?.toISOString() || null, reason: isCurrent ? 'current_status_confirmed' : 'current_status_not_confirmed' };
}

module.exports = { assessFreshness, parseDate };
