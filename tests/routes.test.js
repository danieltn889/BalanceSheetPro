const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');
const path = require('path');
const db = require('../src/database');

describe('BalanceSheet Pro API', () => {
  let authToken;

  beforeAll(async () => {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Register a test user with unique username
    const uniqueUsername = `testuser_${Date.now()}`;
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        username: uniqueUsername,
        email: `${uniqueUsername}@example.com`,
        password: 'testpass123'
      });

    expect(registerRes.status).toBe(201);
    authToken = registerRes.body.token;
  }, 10000); // Increase timeout for database initialization

  test('GET /summary returns totals', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totals');
    expect(res.body.totals).toHaveProperty('income');
    expect(res.body.totals).toHaveProperty('expenses');
    expect(res.body.totals).toHaveProperty('assets');
    expect(res.body.totals).toHaveProperty('loansGiven');
    expect(res.body.totals).toHaveProperty('loansTaken');
    expect(res.body.totals).toHaveProperty('netAssets');
  });

  test('POST /income creates item and returns 201', async () => {
    const res = await request(app)
      .post('/income')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 1000,
        category: 'salary',
        date: '2025-12-01'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(1000);
    expect(res.body.category).toBe('salary');
  });

  test('POST /expenses creates item and returns 201', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 500,
        category: 'food',
        date: '2025-12-01'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /expenses validates amount', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: -10,
        category: 'food',
        date: '2025-12-01'
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /assets creates item and returns 201', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 5000,
        category: 'savings',
        date: '2025-12-01'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /loans creates loan given and returns 201', async () => {
    const res = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        borrower: 'John Doe',
        amount: 2000,
        interest: 5,
        dueDate: '2026-12-01',
        type: 'given'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('given');
  });

  test('POST /loans creates loan taken and returns 201', async () => {
    const res = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lender: 'Bank ABC',
        amount: 10000,
        interest: 8,
        dueDate: '2026-06-01',
        type: 'taken'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('taken');
  });

  test('POST /loans validates required fields', async () => {
    const res = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 1000,
        type: 'given'
        // missing borrower and dueDate
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /income returns array', async () => {
    const res = await request(app)
      .get('/income')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /expenses returns array', async () => {
    const res = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /assets returns array', async () => {
    const res = await request(app)
      .get('/assets')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /loans returns array', async () => {
    const res = await request(app)
      .get('/loans')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // Close database connection
    if (db && typeof db.close === 'function') {
      await new Promise((resolve) => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          resolve();
        });
      });
    }
  });
});
