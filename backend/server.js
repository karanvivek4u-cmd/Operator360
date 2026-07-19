require('./utils/env'); // Load env vars first
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 4000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:8080";

// Middleware
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/operators', require('./routes/operators'));
app.use('/api/service-requests', require('./routes/serviceRequests'));
app.use('/api/operator-chat', require('./routes/chat'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/machines', require('./routes/machines'));

// Health Check
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Operator360 backend listening on http://localhost:${PORT}`);
});