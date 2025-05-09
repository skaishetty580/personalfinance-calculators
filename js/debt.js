class DebtCalculator {
    constructor(container) {
        this.container = container;
        this.debts = [];
        this.chart = null;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div id="debt-entries">
                    <div class="debt-entry">
                        <div class="input-row">
                            <div class="input-group">
                                <label for="debt-name-1">Debt Name</label>
                                <input type="text" id="debt-name-1" placeholder="Credit Card" class="debt-name">
                            </div>
                            <div class="input-group">
                                <label for="debt-balance-1">Current Balance ($)</label>
                                <input type="number" id="debt-balance-1" placeholder="5,000" class="debt-balance">
                            </div>
                        </div>
                        <div class="input-row">
                            <div class="input-group">
                                <label for="debt-rate-1">Interest Rate (%)</label>
                                <input type="number" id="debt-rate-1" placeholder="18.99" step="0.01" class="debt-rate">
                            </div>
                            <div class="input-group">
                                <label for="debt-payment-1">Monthly Payment ($)</label>
                                <input type="number" id="debt-payment-1" placeholder="200" class="debt-payment">
                            </div>
                        </div>
                        <button class="button remove-debt" style="display: none;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                
                <button id="add-debt" class="button card-button">
                    <i class="fas fa-plus"></i> Add Another Debt
                </button>
                
                <div class="input-group">
                    <label for="payoff-method">Payoff Method</label>
                    <select id="payoff-method">
                        <option value="avalanche">Avalanche (Highest Interest First)</option>
                        <option value="snowball">Snowball (Smallest Balance First)</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="extra-payment">Extra Monthly Payment ($)</label>
                    <input type="number" id="extra-payment" placeholder="100">
                </div>
                
                <button id="calculate-debt" class="button cta-button">
                    <i class="fas fa-calculator"></i> Calculate Payoff Plan
                </button>
                
                <div id="debt-results" class="results-container" style="display: none;">
                    <h3>Debt Payoff Analysis</h3>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Total Debt</h4>
                            <p id="total-debt">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Interest</h4>
                            <p id="total-interest">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Payoff Time</h4>
                            <p id="payoff-time">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Paid</h4>
                            <p id="total-paid">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="debt-chart"></canvas>
                    </div>
                    
                    <div class="payoff-plan">
                        <h4>Payoff Plan</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Debt</th>
                                        <th>Payment</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Remaining</th>
                                    </tr>
                                </thead>
                                <tbody id="payoff-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addDebtEntry() {
        const debtCount = document.querySelectorAll('.debt-entry').length + 1;
        const debtEntry = document.createElement('div');
        debtEntry.className = 'debt-entry';
        debtEntry.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label for="debt-name-${debtCount}">Debt Name</label>
                    <input type="text" id="debt-name-${debtCount}" placeholder="Credit Card" class="debt-name">
                </div>
                <div class="input-group">
                    <label for="debt-balance-${debtCount}">Current Balance ($)</label>
                    <input type="number" id="debt-balance-${debtCount}" placeholder="5,000" class="debt-balance">
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label for="debt-rate-${debtCount}">Interest Rate (%)</label>
                    <input type="number" id="debt-rate-${debtCount}" placeholder="18.99" step="0.01" class="debt-rate">
                </div>
                <div class="input-group">
                    <label for="debt-payment-${debtCount}">Monthly Payment ($)</label>
                    <input type="number" id="debt-payment-${debtCount}" placeholder="200" class="debt-payment">
                </div>
            </div>
            <button class="button remove-debt">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        document.getElementById('debt-entries').appendChild(debtEntry);
        
        // Show remove button on all entries except the first one
        const removeButtons = document.querySelectorAll('.remove-debt');
        if (removeButtons.length > 1) {
            removeButtons[0].style.display = 'block';
        }
        
        // Add event listener to the new remove button
        debtEntry.querySelector('.remove-debt').addEventListener('click', (e) => {
            e.preventDefault();
            debtEntry.remove();
            
            // Hide remove button on first entry if only one remains
            if (document.querySelectorAll('.debt-entry').length === 1) {
                document.querySelector('.remove-debt').style.display = 'none';
            }
        });
    }

    calculate() {
        // Get all debts
        this.debts = [];
        const debtEntries = document.querySelectorAll('.debt-entry');
        
        debtEntries.forEach((entry, index) => {
            const name = entry.querySelector('.debt-name').value || `Debt ${index + 1}`;
            const balance = parseFloat(entry.querySelector('.debt-balance').value) || 0;
            const rate = parseFloat(entry.querySelector('.debt-rate').value) || 0;
            const payment = parseFloat(entry.querySelector('.debt-payment').value) || 0;
            
            if (balance > 0 && payment > 0) {
                this.debts.push({
                    name,
                    balance,
                    rate,
                    payment,
                    remaining: balance,
                    interestPaid: 0
                });
            }
        });
        
        if (this.debts.length === 0) {
            alert('Please enter at least one valid debt');
            return;
        }
        
        // Get payoff method and extra payment
        const method = document.getElementById('payoff-method').value;
        const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
        
        // Sort debts based on payoff method
        if (method === 'avalanche') {
            this.debts.sort((a, b) => b.rate - a.rate);
        } else { // snowball
            this.debts.sort((a, b) => a.balance - b.balance);
        }
        
        // Calculate payoff plan
        const payoffPlan = [];
        let month = 0;
        let totalPaid = 0;
        let totalInterest = 0;
        let debtsRemaining = this.debts.length;
        
        while (debtsRemaining > 0) {
            month++;
            let availableExtra = extraPayment;
            
            // Make minimum payments on all debts
            this.debts.forEach(debt => {
                if (debt.remaining > 0) {
                    const interest = debt.remaining * (debt.rate / 100 / 12);
                    let principal = Math.min(debt.payment - interest, debt.remaining);
                    
                    debt.remaining -= principal;
                    debt.interestPaid += interest;
                    totalInterest += interest;
                    totalPaid += debt.payment;
                    
                    payoffPlan.push({
                        month,
                        debt: debt.name,
                        payment: debt.payment,
                        principal,
                        interest,
                        remaining: debt.remaining
                    });
                }
            });
            
            // Apply extra payments to first remaining debt in priority order
            while (availableExtra > 0 && debtsRemaining > 0) {
                const activeDebt = this.debts.find(debt => debt.remaining > 0);
                
                if (!activeDebt) break;
                
                const extra = Math.min(availableExtra, activeDebt.remaining);
                activeDebt.remaining -= extra;
                totalPaid += extra;
                availableExtra -= extra;
                
                payoffPlan.push({
                    month,
                    debt: activeDebt.name,
                    payment: extra,
                    principal: extra,
                    interest: 0,
                    remaining: activeDebt.remaining
                });
                
                if (activeDebt.remaining <= 0) {
                    debtsRemaining--;
                }
            }
        }
        
        // Calculate total debt
        const totalDebt = this.debts.reduce((sum, debt) => sum + debt.balance, 0);
        
        // Display results
        document.getElementById('total-debt').textContent = `$${totalDebt.toLocaleString('en-US')}`;
        document.getElementById('total-interest').textContent = `$${totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('payoff-time').textContent = `${month} months (${(month/12).toFixed(1)} years)`;
        document.getElementById('total-paid').textContent = `$${totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        
        // Generate payoff plan table
        this.generatePayoffPlanTable(payoffPlan);
        
        // Generate chart
        this.generateChart(totalDebt, totalInterest);
        
        // Show results
        document.getElementById('debt-results').style.display = 'block';
    }

    generatePayoffPlanTable(plan) {
        const payoffBody = document.getElementById('payoff-body');
        payoffBody.innerHTML = '';
        
        // Only show every 6 months and final month for brevity
        const filteredPlan = plan.filter((item, index) => {
            return item.month % 6 === 0 || 
                   index === 0 || 
                   index === plan.length - 1 ||
                   (index > 0 && item.month !== plan[index-1].month);
        });
        
        filteredPlan.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.month}</td>
                <td>${item.debt}</td>
                <td>$${item.payment.toFixed(2)}</td>
                <td>$${item.principal.toFixed(2)}</td>
                <td>$${item.interest.toFixed(2)}</td>
                <td>$${item.remaining.toFixed(2)}</td>
            `;
            payoffBody.appendChild(row);
        });
    }

    generateChart(principal, interest) {
        const ctx = document.getElementById('debt-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: [
                        '#4361ee',
                        '#f72585'
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${value.toLocaleString('en-US')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('add-debt').addEventListener('click', (e) => {
            e.preventDefault();
            this.addDebtEntry();
        });
        
        document.getElementById('calculate-debt').addEventListener('click', (e) => {
            e.preventDefault();
            this.calculate();
        });
    }
}
