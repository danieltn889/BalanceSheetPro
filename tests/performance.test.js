import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  scenarios: (function(){
    if (__ENV.K6_ENV === 'local') {
      return {
        default: {
          executor: 'constant-vus',
          vus: 5,
          duration: '1m30s',
          gracefulStop: '30s'
        }
      };
    }
    return {
      default: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
          { duration: '10s', target: 2 },
          { duration: '1m', target: 5 },
          { duration: '1m', target: 5 },
          { duration: '30s', target: 2 },
          { duration: '30s', target: 0 }
        ],
        gracefulStop: '90s'
      }
    };
  })()
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
    errors: ['rate<0.1'] // Custom error rate below 10%
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { username: 'perf_user_1', email: 'perf1@example.com', password: 'testpass123' },
  { username: 'perf_user_2', email: 'perf2@example.com', password: 'testpass123' },
  { username: 'perf_user_3', email: 'perf3@example.com', password: 'testpass123' }
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  // Register/Login to get token
  let authToken = '';

  // Try to register first (might fail if user exists, that's ok)
  const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    username: user.username,
    email: user.email,
    password: user.password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (registerResponse.status === 201) {
    authToken = registerResponse.json().token;
  } else {
    // User might already exist, try login
    const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      username: user.username,
      password: user.password
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.status === 200) {
      authToken = loginResponse.json().token;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  // Test 1: Get summary (most common read operation)
  const summaryStart = new Date().getTime();
  const summaryResponse = http.get(`${BASE_URL}/summary`, { headers });
  const summaryDuration = new Date().getTime() - summaryStart;

  responseTime.add(summaryDuration);

  const summaryCheck = check(summaryResponse, {
    'summary status is 200': (r) => r.status === 200,
    'summary has totals': (r) => Object.prototype.hasOwnProperty.call(r.json(), 'totals'),
    'summary response time < 300ms': (r) => r.timings.duration < 300
  });

  errorRate.add(!summaryCheck);

  // Test 2: Add income (write operation)
  const incomeData = {
    amount: Math.floor(Math.random() * 5000) + 100,
    description: `Performance test income ${Math.random()}`,
    date: new Date().toISOString().split('T')[0]
  };

  const incomeStart = new Date().getTime();
  const incomeResponse = http.post(`${BASE_URL}/income`, JSON.stringify(incomeData), { headers });
  const incomeDuration = new Date().getTime() - incomeStart;

  responseTime.add(incomeDuration);

  const incomeCheck = check(incomeResponse, {
    'income creation status is 201': (r) => r.status === 201,
    'income response time < 500ms': (r) => r.timings.duration < 500
  });

  errorRate.add(!incomeCheck);

  // Test 3: Add expense (another write operation)
  const expenseData = {
    amount: Math.floor(Math.random() * 1000) + 50,
    description: `Performance test expense ${Math.random()}`,
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  };

  const expenseStart = new Date().getTime();
  const expenseResponse = http.post(`${BASE_URL}/expenses`, JSON.stringify(expenseData), { headers });
  const expenseDuration = new Date().getTime() - expenseStart;

  responseTime.add(expenseDuration);

  const expenseCheck = check(expenseResponse, {
    'expense creation status is 201': (r) => r.status === 201,
    'expense response time < 500ms': (r) => r.timings.duration < 500
  });

  errorRate.add(!expenseCheck);

  // Test 4: Health check (lightweight endpoint)
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100
  });

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
  // Pace iterations slightly to reduce back-to-back request interruptions
  sleep(0.2);
}
