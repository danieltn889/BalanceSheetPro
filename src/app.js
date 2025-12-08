const express = require('express');
const path = require('path');
const morgan = require('morgan');
const metrics = require('./metrics');
const routes = require('./routes');

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

module.exports = app;
