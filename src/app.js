const express = require('express');
const path = require('path');
const morgan = require('morgan');
const metrics = require('./metrics');
const routes = require('./routes');
// eslint-disable-next-line no-unused-vars
const db = require('./database'); // Initialize database

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(morgan('dev'));

// Metrics endpoint
app.use(metrics.middleware);
app.get('/metrics', metrics.handler);

// API routes
app.use('/income', routes.income);
app.use('/expenses', routes.expenses);
app.use('/assets', routes.assets);
app.use('/loans', routes.loans);
app.use('/summary', routes.summary);
app.use('/auth', routes.auth);

// Alert webhook endpoint (for Alertmanager integration)
app.post('/webhook/alert', express.json(), (req, res) => {
  try {
    const alerts = req.body.alerts || [req.body];

    for (const alert of alerts) {
      console.log(`🚨 Alert received: ${alert.labels.alertname} (${alert.labels.severity})`);

      // Trigger automated response via script
      const { spawn } = require('child_process');
      const scriptPath = require('path').join(__dirname, '../scripts/alert-webhook-handler.sh');

      const alertData = {
        labels: alert.labels,
        annotations: alert.annotations,
        value: alert.value,
        status: alert.status,
        startsAt: alert.startsAt,
        endsAt: alert.endsAt
      };

      // Pass alert data to script via environment variables
      const env = {
        ...process.env,
        ALERT_DATA: JSON.stringify(alertData),
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || 'danieltn889/BalanceSheetPro'
      };

      const child = spawn(scriptPath, [], { env, stdio: 'inherit' });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Alert processing script completed successfully');
        } else {
          console.error(`❌ Alert processing script failed with code ${code}`);
        }
      });
    }

    res.status(200).json({ status: 'alert_received', alerts_processed: alerts.length });
  } catch (error) {
    console.error('Error processing alert webhook:', error);
    res.status(500).json({ error: 'Failed to process alert' });
  }
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = app;
