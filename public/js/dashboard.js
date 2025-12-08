// Dashboard functionality
const API_URL = '';  // Same origin

let currentData = {
  income: [],
  expenses: [],
  assets: [],
  loansGiven: [],
  loansTaken: []
};

let currentFilter = {
  period: 'month',
  startDate: null,
  endDate: null
};

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = '/';
    return;
  }
  
  // Display user greeting
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userGreeting').textContent = `Welcome, ${user.name || 'User'}!`;
  
  // Logout handler
  document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/';
  });
  
  // Navigation between sections
  document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      switchSection(section);
      
      // Update active state
      document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Form handlers
  setupFormHandlers();
  
  // Load initial data
  loadAllData();
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.value = today;
  });
  
  // Handle "Other" category fields
  setupCategoryHandlers();
  
  // Setup filter handlers
  setupFilterHandlers();
});

function setupCategoryHandlers() {
  // Income category
  document.getElementById('incomeCategory').addEventListener('change', function() {
    const otherField = document.getElementById('incomeOtherField');
    const otherInput = document.getElementById('incomeOtherText');
    if (this.value === 'Other') {
      otherField.style.display = 'block';
      otherInput.required = true;
    } else {
      otherField.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  });
  
  // Expenses category
  document.getElementById('expensesCategory').addEventListener('change', function() {
    const otherField = document.getElementById('expensesOtherField');
    const otherInput = document.getElementById('expensesOtherText');
    if (this.value === 'Other') {
      otherField.style.display = 'block';
      otherInput.required = true;
    } else {
      otherField.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  });
  
  // Assets category
  document.getElementById('assetsCategory').addEventListener('change', function() {
    const otherField = document.getElementById('assetsOtherField');
    const otherInput = document.getElementById('assetsOtherText');
    if (this.value === 'Other') {
      otherField.style.display = 'block';
      otherInput.required = true;
    } else {
      otherField.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  });
}

function setupFilterHandlers() {
  const filterPeriod = document.getElementById('filterPeriod');
  const applyFilter = document.getElementById('applyFilter');
  const startDate = document.getElementById('filterStartDate');
  const endDate = document.getElementById('filterEndDate');
  
  filterPeriod.addEventListener('change', function() {
    currentFilter.period = this.value;
    applyCurrentFilter();
  });
  
  applyFilter.addEventListener('click', function() {
    if (startDate.value && endDate.value) {
      currentFilter.startDate = startDate.value;
      currentFilter.endDate = endDate.value;
      currentFilter.period = 'custom';
      applyCurrentFilter();
    }
  });
}

function applyCurrentFilter() {
  const filtered = filterDataByPeriod(currentData, currentFilter);
  const summary = calculateSummary(filtered);
  updateSummary(summary);
  updateBalanceSheet(summary);
  updateFilteredTables(filtered);
}

function filterDataByPeriod(data, filter) {
  const now = new Date();
  let startDate, endDate;
  
  switch(filter.period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = new Date(weekStart.setHours(0, 0, 0, 0));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'custom':
      startDate = new Date(filter.startDate);
      endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59);
      break;
    default:
      return data;
  }
  
  return {
    income: data.income.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    }),
    expenses: data.expenses.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    }),
    assets: data.assets,
    loansGiven: data.loansGiven || [],
    loansTaken: data.loansTaken || []
  };
}

function calculateSummary(data) {
  const incomeTotal = data.income.reduce((s, i) => s + i.amount, 0);
  const expensesTotal = data.expenses.reduce((s, e) => s + e.amount, 0);
  const assetsTotal = data.assets.reduce((s, a) => s + a.amount, 0);
  const loansGivenTotal = (data.loansGiven || []).reduce((s, l) => s + l.amount, 0);
  const loansTakenTotal = (data.loansTaken || []).reduce((s, l) => s + l.amount, 0);
  const cashFlow = incomeTotal - expensesTotal;
  const netWorth = assetsTotal + loansGivenTotal - loansTakenTotal + cashFlow;
  
  return {
    totals: { 
      income: incomeTotal, 
      expenses: expensesTotal, 
      assets: assetsTotal,
      loansGiven: loansGivenTotal,
      loansTaken: loansTakenTotal,
      cashFlow,
      netWorth
    },
    count: { 
      income: data.income.length, 
      expenses: data.expenses.length, 
      assets: data.assets.length,
      loans: (data.loansGiven || []).length + (data.loansTaken || []).length
    }
  };
}

function updateBalanceSheet(summary) {
  document.getElementById('summaryAssets').textContent = `$${summary.totals.assets.toFixed(2)}`;
  document.getElementById('summaryLoansGiven').textContent = `$${summary.totals.loansGiven.toFixed(2)}`;
  document.getElementById('summaryIncome').textContent = `$${summary.totals.income.toFixed(2)}`;
  document.getElementById('summaryExpenses').textContent = `$${summary.totals.expenses.toFixed(2)}`;
  document.getElementById('summaryLoansTaken').textContent = `$${summary.totals.loansTaken.toFixed(2)}`;
  document.getElementById('summaryCashFlow').textContent = `$${summary.totals.cashFlow.toFixed(2)}`;
  document.getElementById('summaryNetWorth').textContent = `$${summary.totals.netWorth.toFixed(2)}`;
  
  // Update cash flow color
  const cashFlowEl = document.getElementById('summaryCashFlow');
  if (summary.totals.cashFlow < 0) {
    cashFlowEl.classList.add('text-danger');
    cashFlowEl.classList.remove('text-success');
  } else {
    cashFlowEl.classList.add('text-success');
    cashFlowEl.classList.remove('text-danger');
  }
  
  // Update net worth color
  const netWorthEl = document.getElementById('summaryNetWorth');
  if (summary.totals.netWorth < 0) {
    netWorthEl.classList.add('text-danger');
    netWorthEl.classList.remove('text-success');
  } else {
    netWorthEl.classList.add('text-success');
    netWorthEl.classList.remove('text-danger');
  }
}

function updateFilteredTables(filteredData) {
  updateTable('income', filteredData.income);
  updateTable('expenses', filteredData.expenses);
  updateTable('assets', filteredData.assets);
  updateLoansGivenTable(filteredData.loansGiven || []);
  updateLoansTakenTable(filteredData.loansTaken || []);
  updateAllLoansTable(filteredData.loansGiven || [], filteredData.loansTaken || []);
}

function switchSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
  document.getElementById(`${section}View`).classList.remove('d-none');
}

function setupFormHandlers() {
  // Income form
  document.getElementById('incomeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let category = document.getElementById('incomeCategory').value;
    if (category === 'Other') {
      category = document.getElementById('incomeOtherText').value;
    }
    const data = {
      amount: parseFloat(document.getElementById('incomeAmount').value),
      category: category,
      date: document.getElementById('incomeDate').value
    };
    
    await addEntry('income', data);
    this.reset();
    document.getElementById('incomeOtherField').style.display = 'none';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
  });
  
  // Expenses form
  document.getElementById('expensesForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let category = document.getElementById('expensesCategory').value;
    if (category === 'Other') {
      category = document.getElementById('expensesOtherText').value;
    }
    const data = {
      amount: parseFloat(document.getElementById('expensesAmount').value),
      category: category,
      date: document.getElementById('expensesDate').value
    };
    
    await addEntry('expenses', data);
    this.reset();
    document.getElementById('expensesOtherField').style.display = 'none';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expensesDate').value = today;
  });
  
  // Assets form
  document.getElementById('assetsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let category = document.getElementById('assetsCategory').value;
    if (category === 'Other') {
      category = document.getElementById('assetsOtherText').value;
    }
    const data = {
      amount: parseFloat(document.getElementById('assetsAmount').value),
      category: category,
      date: document.getElementById('assetsDate').value
    };
    
    await addEntry('assets', data);
    this.reset();
    document.getElementById('assetsOtherField').style.display = 'none';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assetsDate').value = today;
  });
  
  // Loans Given form
  document.getElementById('loansGivenForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      borrower: document.getElementById('loansGivenBorrower').value,
      amount: parseFloat(document.getElementById('loansGivenAmount').value),
      interest: parseFloat(document.getElementById('loansGivenInterest').value) || 0,
      dueDate: document.getElementById('loansGivenDueDate').value,
      type: 'given'
    };
    
    await addEntry('loans', data);
    this.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('loansGivenDueDate').value = today;
  });
  
  // Loans Taken form
  document.getElementById('loansTakenForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      lender: document.getElementById('loansTakenLender').value,
      amount: parseFloat(document.getElementById('loansTakenAmount').value),
      interest: parseFloat(document.getElementById('loansTakenInterest').value) || 0,
      dueDate: document.getElementById('loansTakenDueDate').value,
      type: 'taken'
    };
    
    await addEntry('loans', data);
    this.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('loansTakenDueDate').value = today;
  });
}

async function addEntry(type, data) {
  try {
    let endpoint = type;
    if (type === 'loans') {
      endpoint = 'loans';
    }
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert(`${capitalize(type)} added successfully!`, 'success');
      await loadAllData();
    } else {
      const error = await response.json();
      showAlert(`Error: ${error.error || 'Failed to add entry'}`, 'danger');
    }
  } catch (error) {
    showAlert('Network error. Please try again.', 'danger');
    console.error(error);
  }
}

async function loadAllData() {
  try {
    // Fetch all data
    const [income, expenses, assets, loans, summary] = await Promise.all([
      fetch(`${API_URL}/income`).then(r => r.json()),
      fetch(`${API_URL}/expenses`).then(r => r.json()),
      fetch(`${API_URL}/assets`).then(r => r.json()),
      fetch(`${API_URL}/loans`).then(r => r.json()),
      fetch(`${API_URL}/summary`).then(r => r.json())
    ]);
    
    currentData = { income, expenses, assets, loansGiven: loans.filter(l => l.type === 'given'), loansTaken: loans.filter(l => l.type === 'taken') };
    
    // Update summary cards and tables with current filter
    const filteredData = filterDataByPeriod(currentData, currentFilter);
    const summaryData = calculateSummary(filteredData);
    updateSummary(summaryData);
    updateBalanceSheet(summaryData);
    updateFilteredTables(filteredData);
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function updateSummary(summary) {
  document.getElementById('totalIncome').textContent = `$${summary.totals.income.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${summary.totals.expenses.toFixed(2)}`;
  document.getElementById('totalAssets').textContent = `$${summary.totals.assets.toFixed(2)}`;
  document.getElementById('cashFlow').textContent = `$${summary.totals.cashFlow.toFixed(2)}`;
  
  // Change cash flow color
  const cashFlowEl = document.getElementById('cashFlow').parentElement.parentElement.parentElement;
  if (summary.totals.cashFlow < 0) {
    cashFlowEl.classList.remove('bg-primary');
    cashFlowEl.classList.add('bg-warning');
  } else {
    cashFlowEl.classList.remove('bg-warning');
    cashFlowEl.classList.add('bg-primary');
  }
}

function updateTable(type, data) {
  const tbody = document.getElementById(`${type}Table`);
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No entries yet</td></tr>';
    return;
  }
  
  // Sort by date (newest first)
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td><span class="badge bg-secondary">${item.category}</span></td>
      <td class="fw-bold">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');
}

function updateLoansGivenTable(data) {
  const tbody = document.getElementById('loansGivenTable');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No loans given yet</td></tr>';
    return;
  }
  
  // Sort by due date (soonest first)
  data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  tbody.innerHTML = data.map(item => {
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const statusClass = isOverdue ? 'text-danger' : 'text-success';
    const statusText = isOverdue ? 'Overdue' : 'Active';
    
    return `
    <tr>
      <td>${item.borrower}</td>
      <td class="fw-bold">$${item.amount.toFixed(2)}</td>
      <td>${item.interest || 0}%</td>
      <td>${formatDate(item.dueDate)}</td>
      <td><span class="badge bg-success">You Receive Payment</span></td>
    </tr>
  `}).join('');
}

function updateLoansTakenTable(data) {
  const tbody = document.getElementById('loansTakenTable');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No loans taken yet</td></tr>';
    return;
  }
  
  // Sort by due date (soonest first)
  data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  tbody.innerHTML = data.map(item => {
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const statusClass = isOverdue ? 'text-danger' : 'text-warning';
    const statusText = isOverdue ? 'Overdue' : 'Active';
    
    return `
    <tr>
      <td>${item.lender}</td>
      <td class="fw-bold">$${item.amount.toFixed(2)}</td>
      <td>${item.interest || 0}%</td>
      <td>${formatDate(item.dueDate)}</td>
      <td><span class="badge bg-danger">You Pay</span></td>
    </tr>
  `}).join('');
}

function updateAllLoansTable(loansGiven, loansTaken) {
  const tbody = document.getElementById('allLoansTable');
  if (!tbody) return;
  
  const allLoans = [
    ...loansGiven.map(loan => ({ ...loan, type: 'Given', direction: 'You Receive Payment', badgeClass: 'bg-success' })),
    ...loansTaken.map(loan => ({ ...loan, type: 'Taken', direction: 'You Pay', badgeClass: 'bg-danger' }))
  ];
  
  if (allLoans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No loans yet</td></tr>';
    return;
  }
  
  // Sort by due date (soonest first)
  allLoans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  tbody.innerHTML = allLoans.map(item => `
    <tr>
      <td><span class="badge ${item.type === 'Given' ? 'bg-success' : 'bg-danger'}">${item.type}</span></td>
      <td>${item.borrower || item.lender}</td>
      <td class="fw-bold">$${item.amount.toFixed(2)}</td>
      <td>${item.interest || 0}%</td>
      <td>${formatDate(item.dueDate)}</td>
      <td><span class="badge ${item.badgeClass}">${item.direction}</span></td>
    </tr>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
