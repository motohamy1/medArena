function createRequestId() { return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`; }

function logEvent(requestId, event, metadata = {}) { console.log(JSON.stringify({ request_id: requestId, event, timestamp: new Date().toISOString(), ...metadata })); }

function requestLogger(req, res, next) {
    const requestId = req.headers['x-request-id'] || createRequestId();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    const startedAt = Date.now();
    logEvent(requestId, 'request_start', { method: req.method, path: req.path });
    res.on('finish', () => logEvent(requestId, 'request_end', { status: res.statusCode, latency_ms: Date.now() - startedAt }));
    next();
}

module.exports = { createRequestId, logEvent, requestLogger };
