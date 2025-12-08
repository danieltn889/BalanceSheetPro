#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COUNT = parseInt(process.env.SEED_USERS || '200', 10);

async function registerUser(u) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(u)
  });
  if (res.status === 201 || res.status === 409) return true;
  const txt = await res.text().catch(() => '');
  console.error('Register failed:', res.status, txt);
  return false;
}

(async () => {
  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const users = [];
  for (let i = 0; i < COUNT; i++) {
    const id = Math.floor(Math.random() * 1e9).toString(36) + Date.now().toString(36) + i;
    users.push({
      username: `art_user_${id}`,
      email: `art_${id}@example.com`,
      password: 'testpass123'
    });
  }

  // Best effort register sequentially to reduce server stress
  for (const u of users) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await registerUser(u);
    } catch (_) {
      // ignore
    }
  }

  const out = path.join(dataDir, 'users.json');
  fs.writeFileSync(out, JSON.stringify(users, null, 2));
  console.log(`Seeded ${users.length} users to ${out}`);
})();
