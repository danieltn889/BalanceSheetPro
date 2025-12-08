const fs = require('fs');
const path = require('path');

let users = null;

module.exports = {
  loadUser: function (context, events, done) {
    try {
      if (!users) {
        const p = path.join(process.cwd(), 'data', 'users.json');
        const raw = fs.readFileSync(p, 'utf-8');
        users = JSON.parse(raw);
      }
      const u = users[Math.floor(Math.random() * users.length)];
      context.vars.username = u.username;
      context.vars.password = u.password;
      done();
    } catch (err) {
      // Fall back to a dummy user to avoid crash; test will fail cleanly
      context.vars.username = 'missing_seed_user';
      context.vars.password = 'testpass123';
      done();
    }
  }
};
