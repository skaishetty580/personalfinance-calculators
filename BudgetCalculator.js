class BudgetCalculator {
    constructor(container) {
        this.container = container;
        this.fixedExpenseCounter = 1;
        this.variableExpenseCounter = 1;
        this.goalCounter = 1;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div id="budget-calculator" class="calculator">
                <h2>Budget Analyzer</h2>
                <div class="input-group">
                    <label for="monthly-income">Monthly Income ($)</label>
                    <input type="number" id="monthly-income" placeholder="5,000">
                </div>
                
                <h3>Fixed Expenses</h3>
                <div id="fixed-expenses">
                    <div class="expense-item">
                        <div class="input-group">
                            <label>Expense Name</label>
                            <input type="text" class="expense-name" placeholder="Rent">
                        </div>
                        <div class="input-group">
                            <label>Amount ($)</label>
                            <input type="number" class="expense-amount" placeholder="1,200">
                        </div>
                    </div>
                </div>
                <button id="add-fixed-expense">Add Fixed Expense</button>
                
                <h3>Variable Expenses</h3>
                <div id="variable-expenses">
                    <div class="expense-item">
                        <div class="input-group">
                            <label>Expense Name</label>
                            <input type="text" class="expense-name" placeholder="Groceries">
                        </div>
                        <div class="input-group">
                            <label>Amount ($)</label>
                            <input type="number" class="expense-amount" placeholder="600">
                        </div>
                    </div>
                </div>
                <button id="add-variable-expense">Add Variable Expense</button>
                
                <h3>Savings Goals</h3>
                <div id="savings-goals">
                    <div class="goal-item">
                        <div class="input-group">
                            <label>Goal Name</label>
                            <input type="text" class="goal-name" placeholder="Emergency Fund">
                        </div>
                        <div class="input-group">
                            <label>Target Amount ($)</label>
                            <input type="number" class="goal-amount" placeholder="10,000">
                        </div>
                        <div class="input-group">
                            <label>Timeframe (months)</label>
                            <input type="number" class="goal-timeframe" placeholder="24">
                        </div>
                    </div>
                </div>
                <button id="add-savings-goal">Add Savings Goal</button>
                
                <button id="analyze-budget">Analyze Budget</button>
                <div id="budget-results" class="results" style="display: none;">
                    <h3>Budget Analysis</h3>
                    <div id="budget-summary"></div>
                    <div id="budget-recommendations"></div>
                    <div id="expense-breakdown"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('add-fixed-expense').addEventListener('click', () => this.addFixedExpense());
        document.getElementById('add-variable-expense').addEventListener('click', () => this.addVariableExpense());
        document.getElementById('add-savings-goal').addEventListener('click', () => this.addSavingsGoal());
        document.getElementById('analyze-budget').addEventListener('click', () => this.analyze());
    }

    addFixedExpense() {
        this.fixedExpenseCounter++;
        const newExpense = document.createElement('div');
        newExpense.className = 'expense-item';
        newExpense.innerHTML = `
            <div class="input-group">
                <label>Expense Name</label>
                <input type="text" class="expense-name" placeholder="Fixed Expense ${this.fixedExpenseCounter}">
            </div>
            <div class="input-group">
                <label>Amount ($)</label>
                <input type="number" class="expense-amount" placeholder="0">
            </div>
        `;
        document.getElementById('fixed-expenses').appendChild(newExpense);
    }

    addVariableExpense() {
        this.variableExpenseCounter++;
        const newExpense = document.createElement('div');
        newExpense.className = 'expense-item';
        newExpense.innerHTML = `
            <div class="input-group">
                <label>Expense Name</label>
                <input type="text" class="expense-name" placeholder="Variable Expense ${this.variableExpenseCounter}">
            </div>
            <div class="input-group">
                <label>Amount ($)</label>
                <input type="number" class="expense-amount" placeholder="0">
            </div>
        `;
        document.getElementById('variable-expenses').appendChild(newExpense);
    }

    addSavingsGoal() {
        this.goalCounter++;
        const newGoal = document.createElement('div');
        newGoal.className = 'goal-item';
        newGoal.innerHTML = `
            <div class="input-group">
                <label>Goal Name</label>
                <input type="text" class="goal-name" placeholder="Goal ${this.goalCounter}">
            </div>
            <div class="input-group">
                <label>Target Amount ($)</label>
                <input type="number" class="goal-amount" placeholder="0">
            </div>
            <div class="input-group">
                <label>Timeframe (months)</label>
                <input type="number" class="goal-timeframe" placeholder="0">
            </div>
        `;
        document.getElementById('savings-goals').appendChild(newGoal);
    }

    analyze() {
        const income = parseFloat(document.getElementById('monthly-income').value) || 0;
        
        const fixedExpenses = [];
        document.querySelectorAll('#fixed-expenses .expense-item').forEach(item => {
            const name = item.querySelector('.expense-name').value || `Fixed Expense ${fixedExpenses.length + 1}`;
            const amount = parseFloat(item.querySelector('.expense-amount').value) || 0;
            if (amount > 0) fixedExpenses.push({ name, amount });
        });
        
        const variableExpenses = [];
        document.querySelectorAll('#variable-expenses .expense-item').forEach(item => {
            const name = item.querySelector('.expense-name').value || `Variable Expense ${variableExpenses.length + 1}`;
            const amount = parseFloat(item.querySelector('.expense-amount').value) || 0;
            if (amount > 0) variableExpenses.push({ name, amount });
        });
        
        const savingsGoals = [];
        document.querySelectorAll('#savings-goals .goal-item').forEach(item => {
            const name = item.querySelector('.goal-name').value || `Goal ${savingsGoals.length + 1}`;
            const amount = parseFloat(item.querySelector('.goal-amount').value) || 0;
            const timeframe = parseFloat(item.querySelector('.goal-timeframe').value) || 1;
            if (amount > 0) savingsGoals.push({ name, amount, timeframe });
        });
        
        const totalFixed = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalVariable = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalMonthlyGoals = savingsGoals.reduce((sum, goal) => sum + (goal.amount / goal.timeframe), 0);
        const disposableIncome = income - totalFixed - totalVariable - totalMonthlyGoals;
        
        let expenseBreakdown = '<h4>Expense Breakdown</h4><ul>';
        fixedExpenses.forEach(exp => {
            expenseBreakdown += `<li>${exp.name}: $${exp.amount.toFixed(2)} (${((exp.amount / income) * 100).toFixed(1)}% of income)</li>`;
        });
        variableExpenses.forEach(exp => {
            expenseBreakdown += `<li>${exp.name}: $${exp.amount.toFixed(2)} (${((exp.amount / income) * 100).toFixed(1)}% of income)</li>`;
        });
        expenseBreakdown += '</ul>';
        
        let goalsBreakdown = '<h4>Savings Goals</h4><ul>';
        savingsGoals.forEach(goal => {
            const monthly = goal.amount / goal.timeframe;
            goalsBreakdown += `<li>${goal.name}: $${monthly.toFixed(2)}/month (${((monthly / income) * 100).toFixed(1)}% of income)</li>`;
        });
        goalsBreakdown += '</ul>';
        
        let recommendations = '<h4>Recommendations</h4><ul>';
        const savingsRate = ((totalMonthlyGoals + (disposableIncome > 0 ? disposableIncome : 0)) / income) * 100;
        
        if (savingsRate < 20) {
            recommendations += '<li>Try to increase your savings rate to at least 20% of income</li>';
        }
        
        if ((totalFixed / income) * 100 > 50) {
            recommendations += '<li>Your fixed expenses are high. Consider ways to reduce these to increase financial flexibility</li>';
        }
        
        if (disposableIncome < 0) {
            recommendations += '<li>Your expenses exceed your income. You need to reduce spending or increase income</li>';
        } else if (disposableIncome < (income * 0.1)) {
            recommendations += '<li>You have limited discretionary income. Look for ways to reduce fixed or variable expenses</li>';
        }
        
        if (recommendations === '<h4>Recommendations</h4><ul>') {
            recommendations += '<li>Your budget looks healthy! Keep up the good work.</li>';
        }
        recommendations += '</ul>';
        
        document.getElementById('budget-summary').innerHTML = `
            <p><strong>Total Income:</strong> $${income.toFixed(2)}</p>
            <p><strong>Total Fixed Expenses:</strong> $${totalFixed.toFixed(2)} (${((totalFixed / income) * 100).toFixed(1)}%)</p>
            <p><strong>Total Variable Expenses:</strong> $${totalVariable.toFixed(2)} (${((totalVariable / income) * 100).toFixed(1)}%)</p>
            <p><strong>Total Savings Goals:</strong> $${totalMonthlyGoals.toFixed(2)}/month (${((totalMonthlyGoals / income) * 100).toFixed(1)}%)</p>
            <p><strong>Disposable Income:</strong> $${disposableIncome.toFixed(2)} (${((disposableIncome / income) * 100).toFixed(1)}%)</p>
            <p><strong>Savings Rate:</strong> ${savingsRate.toFixed(1)}%</p>
        `;
        
        document.getElementById('expense-breakdown').innerHTML = expenseBreakdown + goalsBreakdown;
        document.getElementById('budget-recommendations').innerHTML = recommendations;
        document.getElementById('budget-results').style.display = 'block';
    }
}