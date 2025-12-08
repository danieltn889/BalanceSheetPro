import http from 'k6/http';
import { check, sleep, textSummary } from 'k6';

// Simple performance test for local development
export const options = {
  vus: 5, // 5 virtual users
  duration: '30s', // Run for 30 seconds

  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests should be below 300ms
    http_req_failed: ['rate<0.1'] // Error rate should be below 10%
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simple health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100
  });

  // Register a test user
  const uniqueUsername = `perf_user_${Math.random().toString(36).substring(7)}`;
  const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    username: uniqueUsername,
    email: `${uniqueUsername}@example.com`,
    password: 'testpass123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  let authToken = '';
  if (registerResponse.status === 201) {
    authToken = registerResponse.json().token;
  }

  if (authToken) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    };

    // Test summary endpoint
    const summaryResponse = http.get(`${BASE_URL}/summary`, { headers });
    check(summaryResponse, {
      'summary status is 200': (r) => r.status === 200,
      'summary response time < 200ms': (r) => r.timings.duration < 200
    });

    // Test adding income
    const incomeResponse = http.post(`${BASE_URL}/income`, JSON.stringify({
      amount: 1000,
      description: 'Performance test income',
      date: new Date().toISOString().split('T')[0]
    }), { headers });

    check(incomeResponse, {
      'income creation status is 201': (r) => r.status === 201,
      'income response time < 300ms': (r) => r.timings.duration < 300
    });
  }

  sleep(1); // Wait 1 second between iterations
}

// Cleanup function that runs after test completion (even if interrupted)
export function teardown (data) {
  console.log('🧹 Test teardown: Cleaning up resources...');
  // Add any cleanup logic here (close connections, delete test data, etc.)
  // Note: In a real scenario, you might want to clean up test users/data
}

// Handle test results and summary
export function handleSummary (data) {
  console.log('📊 Performance Test Summary:');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%`);
  console.log(`Average Response Time: ${Math.round(data.metrics.http_req_duration.values.avg)}ms`);
  console.log(`95th Percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms`);

  // Return default summary
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'performance-summary.json': JSON.stringify(data, null, 2)
  };
}
