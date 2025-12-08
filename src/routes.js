const express = require('express');
const store = require('./store');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const income = express.Router();
const expenses = express.Router();
const assets = express.Router();
const loans = express.Router();
const summary = express.Router();
const auth = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

function validateEntry (req, res, next) {
  const { amount, category, date } = req.body;
  if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'amount must be a non-negative number' });
  if (!category || typeof category !== 'string') return res.status(400).json({ error: 'category is required' });
  if (!date || isNaN(Date.parse(date))) return res.status(400).json({ error: 'valid date is required' });
  next();
}

function validateLoan (req, res, next) {
  const { borrower, lender, amount, interest, dueDate, type } = req.body;
  if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'amount must be a non-negative number' });
  if (interest !== undefined && (typeof interest !== 'number' || interest < 0)) return res.status(400).json({ error: 'interest must be a non-negative number' });
  if (!dueDate || isNaN(Date.parse(dueDate))) return res.status(400).json({ error: 'valid dueDate is required' });
  if (type === 'given' && !borrower) return res.status(400).json({ error: 'borrower is required for loans given' });
  if (type === 'taken' && !lender) return res.status(400).json({ error: 'lender is required for loans taken' });
  next();
}

income.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await store.getAll('income', req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

income.post('/', authenticateToken, validateEntry, async (req, res) => {
  try {
    const item = await store.add('income', req.body, req.user.id);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

expenses.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await store.getAll('expenses', req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

expenses.post('/', authenticateToken, validateEntry, async (req, res) => {
  try {
    const item = await store.add('expenses', req.body, req.user.id);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

assets.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await store.getAll('assets', req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

assets.post('/', authenticateToken, validateEntry, async (req, res) => {
  try {
    const item = await store.add('assets', req.body, req.user.id);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

loans.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await store.getAll('loans', req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

loans.post('/', authenticateToken, validateLoan, async (req, res) => {
  try {
    const item = await store.add('loans', req.body, req.user.id);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

summary.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await store.computeSummary(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication routes
auth.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
          res.status(201).json({ token, user: { id: this.lastID, username, email } });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

auth.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { income, expenses, assets, loans, summary, auth };
