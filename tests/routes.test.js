const request = require('supertest');
const app = require('../src/app');

describe('BalanceSheet Pro API', () => {
  test('GET /summary returns totals', async () => {
    const res = await request(app).get('/summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totals');
  });

  test('POST /income creates item and returns 201', async () => {
    const res = await request(app).post('/income').send({ amount: 1000, category: 'salary', date: '2025-12-01' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /expenses validates amount', async () => {
    const res = await request(app).post('/expenses').send({ amount: -10, category: 'food', date: '2025-12-01' });
    expect(res.status).toBe(400);
  });
});
