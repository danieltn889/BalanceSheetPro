// SQLite database store; uses shared database connection
const db = require('./database');

function add (type, item, userId) {
  return new Promise((resolve, reject) => {
    let columns, placeholders, values;

    if (type === 'loans') {
      columns = 'user_id, borrower, lender, amount, interest, due_date, type';
      placeholders = '?, ?, ?, ?, ?, ?, ?';
      values = [userId, item.borrower, item.lender, item.amount, item.interest || 0, item.dueDate, item.type];
    } else {
      columns = 'user_id, amount, category, date';
      placeholders = '?, ?, ?, ?';
      values = [userId, item.amount, item.category, item.date];
    }

    const stmt = db.prepare(`INSERT INTO ${type} (${columns}) VALUES (${placeholders})`);

    stmt.run(values, function (err) {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve({ ...item, id: this.lastID });
      }
    });

    stmt.finalize();
  });
}

function getAll (type, userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${type} WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function computeSummary (userId) {
  return new Promise((resolve, reject) => {
    const queries = [
      `SELECT SUM(amount) as total FROM income WHERE user_id = ${userId}`,
      `SELECT SUM(amount) as total FROM expenses WHERE user_id = ${userId}`,
      `SELECT SUM(amount) as total FROM assets WHERE user_id = ${userId}`,
      `SELECT SUM(amount) as total FROM loans WHERE user_id = ${userId} AND type = 'given'`,
      `SELECT SUM(amount) as total FROM loans WHERE user_id = ${userId} AND type = 'taken'`,
      `SELECT COUNT(*) as count FROM income WHERE user_id = ${userId}`,
      `SELECT COUNT(*) as count FROM expenses WHERE user_id = ${userId}`,
      `SELECT COUNT(*) as count FROM assets WHERE user_id = ${userId}`,
      `SELECT COUNT(*) as count FROM loans WHERE user_id = ${userId}`
    ];

    Promise.all(queries.map(query =>
      new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.total || row.count || 0 : 0);
        });
      })
    )).then(([incomeTotal, expensesTotal, assetsTotal, loansGivenTotal, loansTakenTotal, incomeCount, expensesCount, assetsCount, loansCount]) => {
      const cashFlow = incomeTotal - expensesTotal;
      const netAssets = assetsTotal + loansGivenTotal - loansTakenTotal;

      resolve({
        totals: {
          income: incomeTotal,
          expenses: expensesTotal,
          assets: assetsTotal,
          loansGiven: loansGivenTotal,
          loansTaken: loansTakenTotal,
          netAssets,
          cashFlow
        },
        count: {
          income: incomeCount,
          expenses: expensesCount,
          assets: assetsCount,
          loans: loansCount
        }
      });
    }).catch(reject);
  });
}

module.exports = { add, getAll, computeSummary };
