// Simple in-memory store; replaceable with DB later
const db = {
  income: [],
  expenses: [],
  assets: [],
  loans: []
};

function add(type, item) {
  const record = { id: Date.now() + Math.random(), ...item };
  db[type].push(record);
  return record;
}

function getAll(type) {
  return db[type];
}

function computeSummary() {
  const incomeTotal = db.income.reduce((s, i) => s + i.amount, 0);
  const expensesTotal = db.expenses.reduce((s, e) => s + e.amount, 0);
  const assetsTotal = db.assets.reduce((s, a) => s + a.amount, 0);
  const loansGivenTotal = db.loans.filter(l => l.type === 'given').reduce((s, l) => s + l.amount, 0);
  const loansTakenTotal = db.loans.filter(l => l.type === 'taken').reduce((s, l) => s + l.amount, 0);
  const cashFlow = incomeTotal - expensesTotal;
  const netAssets = assetsTotal + loansGivenTotal - loansTakenTotal;
  return {
    totals: { 
      income: incomeTotal, 
      expenses: expensesTotal, 
      assets: assetsTotal, 
      loansGiven: loansGivenTotal,
      loansTaken: loansTakenTotal,
      netAssets: netAssets,
      cashFlow 
    },
    count: { 
      income: db.income.length, 
      expenses: db.expenses.length, 
      assets: db.assets.length,
      loans: db.loans.length
    }
  };
}

module.exports = { add, getAll, computeSummary };
