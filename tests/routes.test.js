const request = require('supertest');
const app = require('../src/app');

describe('BalanceSheet Pro API', () => {
  test('GET /summary returns totals', async () => {
    const res = await request(app).get('/summary');
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
    const res = await request(app).post('/income').send({
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
    const res = await request(app).post('/expenses').send({
      amount: 500,
      category: 'food',
      date: '2025-12-01'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /expenses validates amount', async () => {
    const res = await request(app).post('/expenses').send({
      amount: -10,
      category: 'food',
      date: '2025-12-01'
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /assets creates item and returns 201', async () => {
    const res = await request(app).post('/assets').send({
      amount: 5000,
      category: 'savings',
      date: '2025-12-01'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /loans creates loan given and returns 201', async () => {
    const res = await request(app).post('/loans').send({
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
    const res = await request(app).post('/loans').send({
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
    const res = await request(app).post('/loans').send({
      amount: 1000,
      type: 'given'
      // missing borrower and dueDate
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /income returns array', async () => {
    const res = await request(app).get('/income');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /expenses returns array', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /assets returns array', async () => {
    const res = await request(app).get('/assets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /loans returns array', async () => {
    const res = await request(app).get('/loans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
