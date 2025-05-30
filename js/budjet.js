class BudgetCalculator {
    constructor(container) {
        this.container = container;
        this.categories = [];
        this.renderForm();
       }
    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="input-row">
                    <div class="input-group">
                        <label for="monthly-income">Monthly Income ($)</label>
                        <input type="number" id="monthly-income" placeholder="5,000">
                    </div>
                    <div class="input-group">
                        <label for="savings-goal">Savings Goal (%)</label>
                        <input type="number" id="savings-goal" placeholder="20" step="0.1">
                    </div>
                </div>
                <h4 style="margin: 20px 0 10px;">Expense Categories</h4>
                <div id="expense-categories">
                    <div class="expense-category">
                        <div class="input-row">
                            <div class="input-group">
                                <label for="category-name-1">Category Name</label>
                                <input type="text" id="category-name-1" placeholder="Housing" class="category-name">
                            </div>
                            <div class="input-group">
                                <label for="category-amount-1">Monthly Amount ($)</label>
                                <input type="number" id="category-amount-1" placeholder="1,500" class="category-amount">
                            </div>
                        </div>
                        <button class="button remove-category" style="display: none;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                <button id="add-category" class="button card-button">
                    <i class="fas fa-plus"></i> Add Another Category
                </button>
                <button id="calculate-budget" class="button cta-button">
                    <i class="fas fa-calculator"></i> Analyze Budget
                </button>
                <div id="budget-results" class="results-container" style="display: none;">
                    <h3>Budget Analysis</h3>
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Monthly Income</h4>
                            <p id="income-result">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Expenses</h4>
                            <p id="total-expenses">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Savings</h4>
                            <p id="savings-amount">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Savings Rate</h4>
                            <p id="savings-rate">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Discretionary Income</h4>
                            <p id="discretionary-income">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Budget Status</h4>
                            <p id="budget-status">-</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="budget-chart"></canvas>
                    </div>
                    <div class="expense-breakdown">
                        <h4>Expense Breakdown</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>% of Income</th>
                                        <th>Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody id="breakdown-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.setupEventListeners();
    }
    addCategory() {
        const categoryCount = document.querySelectorAll('.expense-category').length + 1;
        const category = document.createElement('div');
        category.className = 'expense-category';
        category.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label for="category-name-${categoryCount}">Category Name</label>
                    <input type="text" id="category-name-${categoryCount}" placeholder="Housing" class="category-name">
                </div>
                <div class="input-group">
                    <label for="category-amount-${categoryCount}">Monthly Amount ($)</label>
                    <input type="number" id="category-amount-${categoryCount}" placeholder="1,500" class="category-amount">
                </div>
            </div>
            <button class="button remove-category">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        document.getElementById('expense-categories').appendChild(category);
        
        // Add event listener to remove button
        category.querySelector('.remove-category').addEventListener('click', (e) => {
            e.preventDefault();
            category.remove();
        });
    }
    calculate() {
        // Get income and savings goal
        const income = parseFloat(document.getElementById('monthly-income').value) || 5000;
        const savingsGoal = parseFloat(document.getElementById('savings-goal').value) || 20;
        
        // Get all expense categories
        this.categories = [];
        const categoryElements = document.querySelectorAll('.expense-category');
        
        categoryElements.forEach((element, index) => {
            const name = element.querySelector('.category-name').value || `Category ${index + 1}`;
            const amount = parseFloat(element.querySelector('.category-amount').value) || 0;
            
            if (name && amount > 0) {
                this.categories.push({
                    name,
                    amount,
                    percentage: (amount / income) * 100
                });
            }
        });
        if (this.categories.length === 0) {
            alert('Please enter at least one expense category');
            return;
        }
        // Calculate totals
        const totalExpenses = this.categories.reduce((sum, category) => sum + category.amount, 0);
        const savingsAmount = income * (savingsGoal / 100);
        const discretionaryIncome = income - totalExpenses - savingsAmount;
        const actualSavingsRate = ((income - totalExpenses) / income) * 100;
        // Determine budget status
        let budgetStatus = '';
        let statusClass = '';
        if (discretionaryIncome < 0) {
            budgetStatus = 'Deficit';
            statusClass = 'danger';
        } else if (actualSavingsRate >= savingsGoal) {
            budgetStatus = 'Healthy';
            statusClass = 'success';
        } else {
            budgetStatus = 'Needs Adjustment';
            statusClass = 'warning';
        }
        // Display results
        document.getElementById('income-result').textContent = `$${income.toLocaleString('en-US')}`;
        document.getElementById('total-expenses').textContent = `$${totalExpenses.toLocaleString('en-US')}`;
        document.getElementById('savings-amount').textContent = `$${savingsAmount.toLocaleString('en-US')}`;
        document.getElementById('savings-rate').textContent = `${actualSavingsRate.toFixed(1)}%`;
        document.getElementById('discretionary-income').textContent = `$${discretionaryIncome.toLocaleString('en-US')}`;
        document.getElementById('budget-status').textContent = budgetStatus;
        document.getElementById('budget-status').className = statusClass;
        // Generate expense breakdown
        this.generateExpenseBreakdown(income);
        // Generate chart
        this.generateChart(income, totalExpenses, savingsAmount, discretionaryIncome);
        // Show results
        document.getElementById('budget-results').style.display = 'block';
    }
    generateExpenseBreakdown(income) {
        const breakdownBody = document.getElementById('breakdown-body');
        breakdownBody.innerHTML = '';
        // Standard budget recommendations (simplified)
        const recommendations = {
            'Housing': '25-35% of income',
            'Transportation': '10-15% of income',
            'Food': '10-15% of income',
            'Utilities': '5-10% of income',
            'Insurance': '10-25% of income',
            'Healthcare': '5-10% of income',
            'Debt': '<10% of income',
            'Entertainment': '5-10% of income',
            'Other': 'Varies'
        };
        this.categories.forEach(category => {
            const row = document.createElement('tr');
            const recommendation = recommendations[category.name] || 'Varies';
            row.innerHTML = `
                <td>${category.name}</td>
                <td>$${category.amount.toLocaleString('en-US')} (${category.percentage.toFixed(1)}%)</td>
                <td>${category.percentage.toFixed(1)}%</td>
                <td>${recommendation}</td>
            `;
            breakdownBody.appendChild(row);
        });
    }
    generateChart(income, expenses, savings, discretionary) {
        const ctx = document.getElementById('budget-chart').getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Expenses', 'Savings', 'Discretionary'],
                datasets: [{
                    data: [expenses, savings, discretionary],
                    backgroundColor: [
                        '#f72585',
                        '#4361ee',
                        '#4cc9f0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / income) * 100);
                                return `${label}: $${value.toLocaleString('en-US')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    setupEventListeners() {
        document.getElementById('add-category').addEventListener('click', (e) => {
            e.preventDefault();
            this.addCategory();
        });
        document.getElementById('calculate-budget').addEventListener('click', () => this.calculate());
    }
}
