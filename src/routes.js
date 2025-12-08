const express = require('express');
const store = require('./store');

const income = express.Router();
const expenses = express.Router();
const assets = express.Router();
const loans = express.Router();
const summary = express.Router();

function validateEntry(req, res, next) {
  const { amount, category, date } = req.body;
  if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'amount must be a non-negative number' });
  if (!category || typeof category !== 'string') return res.status(400).json({ error: 'category is required' });
  if (!date || isNaN(Date.parse(date))) return res.status(400).json({ error: 'valid date is required' });
  next();
}

function validateLoan(req, res, next) {
  const { borrower, lender, amount, interest, dueDate, type } = req.body;
  if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'amount must be a non-negative number' });
  if (interest !== undefined && (typeof interest !== 'number' || interest < 0)) return res.status(400).json({ error: 'interest must be a non-negative number' });
  if (!dueDate || isNaN(Date.parse(dueDate))) return res.status(400).json({ error: 'valid dueDate is required' });
  if (type === 'given' && !borrower) return res.status(400).json({ error: 'borrower is required for loans given' });
  if (type === 'taken' && !lender) return res.status(400).json({ error: 'lender is required for loans taken' });
  next();
}

income.get('/', (req, res) => {
  res.json(store.getAll('income'));
});

income.post('/', validateEntry, (req, res) => {
  const item = store.add('income', req.body);
  res.status(201).json(item);
});

expenses.get('/', (req, res) => {
  res.json(store.getAll('expenses'));
});

expenses.post('/', validateEntry, (req, res) => {
  const item = store.add('expenses', req.body);
  res.status(201).json(item);
});

assets.get('/', (req, res) => {
  res.json(store.getAll('assets'));
});

assets.post('/', validateEntry, (req, res) => {
  const item = store.add('assets', req.body);
  res.status(201).json(item);
});

loans.get('/', (req, res) => {
  res.json(store.getAll('loans'));
});

loans.post('/', validateLoan, (req, res) => {
  const item = store.add('loans', req.body);
  res.status(201).json(item);
});

summary.get('/', (req, res) => {
  const data = store.computeSummary();
  res.json(data);
});

module.exports = { income, expenses, assets, loans, summary };
