require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { hasApiKey } = require('./services/aiService');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const AutonomousScientist = require('./services/autonomousScientistService');
const { requestLogger } = require('./services/structuredLogger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Inject progress hook
const { broadcastScientistProgress } = require('./routes/adminRoutes');
// adminRoutes module.exports is the router, so we need to grab the helper differently
// or just re-export it. Let's fix adminRoutes to export the helper.

const PORT = process.env.PORT || 3001;

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Chat endpoints
app.use('/api/chat', chatRoutes);
app.use('/api/chat/v2', require('./routes/chatV2Routes'));
app.use('/api/admin', adminRoutes.router);
app.use('/api/topics', require('./routes/topicRoutes'));

// Connect Scientist Agent to SSE Broadcaster
AutonomousScientist.progressCallback = adminRoutes.broadcastScientistProgress;

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Med Arena Clinical Backend running on http://0.0.0.0:${PORT}`);
    if (hasApiKey) {
        console.log(`   Gemini API key active`);
    } else {
        console.log(`   ⚠️ GEMINI_API_KEY is missing in backend/.env`);
    }
});
