class DebtCalculator {
    constructor(container) {
        this.container = container;
        this.debts = [];
        this.chart = null;
        this.maxMonths = 600; // 50 year maximum to prevent infinite loops
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
        this.container.querySelector('#debt-entries').appendChild(debtEntry);
        
        // Show remove button on all entries except the first one
        const removeButtons = this.container.querySelectorAll('.remove-debt');
        if (removeButtons.length > 1) {
            removeButtons[0].style.display = 'block';
        }
        
        // Add event listener to the new remove button
        debtEntry.querySelector('.remove-debt').addEventListener('click', (e) => {
            e.preventDefault();
            debtEntry.remove();
            
            // Hide remove button on first entry if only one remains
            if (this.container.querySelectorAll('.debt-entry').length === 1) {
                this.container.querySelector('.remove-debt').style.display = 'none';
            }
        });
    }

    async calculate() {
        // Show loading state
        const calculateBtn = this.container.querySelector('#calculate-debt');
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        try {
            // Get all debts
            this.debts = [];
            const debtEntries = this.container.querySelectorAll('.debt-entry');
            
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
            const method = this.container.querySelector('#payoff-method').value;
            const extraPayment = parseFloat(this.container.querySelector('#extra-payment').value) || 0;
            
            // Sort debts based on payoff method
            if (method === 'avalanche') {
                this.debts.sort((a, b) => b.rate - a.rate);
            } else { // snowball
                this.debts.sort((a, b) => a.balance - b.balance);
            }
            
            // Calculate payoff plan
            const result = await this.calculatePayoffPlan(extraPayment);
            
            // Display results
            this.displayResults(result);
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred during calculation');
        } finally {
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Payoff Plan';
        }
    }

    calculatePayoffPlan(extraPayment) {
        return new Promise((resolve) => {
            const result = {
                payoffPlan: [],
                totalDebt: this.debts.reduce((sum, debt) => sum + debt.balance, 0),
                totalInterest: 0,
                totalPaid: 0,
                months: 0
            };

            const calculateChunk = () => {
                const startTime = performance.now();
                let monthsProcessed = 0;
                
                while (result.months < this.maxMonths) {
                    result.months++;
                    monthsProcessed++;
                    let availableExtra = extraPayment;
                    let debtsRemaining = 0;
                    
                    // Process minimum payments
                    for (const debt of this.debts) {
                        if (debt.remaining > 0) {
                            debtsRemaining++;
                            const interest = debt.remaining * (debt.rate / 100 / 12);
                            const principal = Math.min(debt.payment - interest, debt.remaining);
                            
                            debt.remaining -= principal;
                            debt.interestPaid += interest;
                            result.totalInterest += interest;
                            result.totalPaid += debt.payment;
                            
                            result.payoffPlan.push({
                                month: result.months,
                                debt: debt.name,
                                payment: debt.payment,
                                principal,
                                interest,
                                remaining: debt.remaining
                            });
                        }
                    }
                    
                    // Process extra payments
                    while (availableExtra > 0 && debtsRemaining > 0) {
                        const activeDebt = this.debts.find(debt => debt.remaining > 0);
                        if (!activeDebt) break;
                        
                        const extra = Math.min(availableExtra, activeDebt.remaining);
                        activeDebt.remaining -= extra;
                        result.totalPaid += extra;
                        availableExtra -= extra;
                        
                        result.payoffPlan.push({
                            month: result.months,
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
                    
                    // Check if we're done
                    if (debtsRemaining === 0) {
                        break;
                    }
                    
                    // Yield to the browser every 50ms of calculation
                    if (performance.now() - startTime > 50) {
                        setTimeout(calculateChunk, 0);
                        return;
                    }
                }
                
                resolve(result);
            };
            
            // Start calculation
            calculateChunk();
        });
    }

    displayResults({ payoffPlan, totalDebt, totalInterest, totalPaid, months }) {
        // Display results
        this.container.querySelector('#total-debt').textContent = `$${totalDebt.toLocaleString('en-US')}`;
        this.container.querySelector('#total-interest').textContent = `$${totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        this.container.querySelector('#payoff-time').textContent = `${months} months (${(months/12).toFixed(1)} years)`;
        this.container.querySelector('#total-paid').textContent = `$${totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        
        // Generate payoff plan table
        this.generatePayoffPlanTable(payoffPlan);
        
        // Generate chart
        this.generateChart(totalDebt, totalInterest);
        
        // Show results
        this.container.querySelector('#debt-results').style.display = 'block';
    }

    generatePayoffPlanTable(plan) {
        const payoffBody = this.container.querySelector('#payoff-body');
        payoffBody.innerHTML = '';
        
        // Track current month to group entries
        let currentMonth = 0;
        let monthGroup = [];
        
        plan.forEach((item, index) => {
            if (item.month !== currentMonth) {
                // Add previous month's group if exists
                if (monthGroup.length > 0) {
                    this.addMonthGroupToTable(payoffBody, currentMonth, monthGroup);
                }
                // Start new month group
                currentMonth = item.month;
                monthGroup = [item];
            } else {
                // Add to current month group
                monthGroup.push(item);
            }
            
            // Add the last month if we're at the end
            if (index === plan.length - 1) {
                this.addMonthGroupToTable(payoffBody, currentMonth, monthGroup);
            }
        });
    }

    addMonthGroupToTable(payoffBody, month, monthGroup) {
        // Add each debt payment for the month
        monthGroup.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month}</td>
                <td>${item.debt}</td>
                <td>$${item.payment.toFixed(2)}</td>
                <td>$${item.principal.toFixed(2)}</td>
                <td>$${item.interest.toFixed(2)}</td>
                <td>$${Math.max(0, item.remaining).toFixed(2)}</td>
            `;
            payoffBody.appendChild(row);
        });
        
        // Add a separator row between months
        if (monthGroup.length > 0) {
            const separator = document.createElement('tr');
            separator.className = 'month-separator';
            separator.innerHTML = `<td colspan="6"></td>`;
            payoffBody.appendChild(separator);
        }
    }

    generateChart(principal, interest) {
        const ctx = this.container.querySelector('#debt-chart').getContext('2d');
        
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
        // Add debt button
        this.container.querySelector('#add-debt').addEventListener('click', (e) => {
            e.preventDefault();
            this.addDebtEntry();
        });
        
        // Calculate button
        this.container.querySelector('#calculate-debt').addEventListener('click', (e) => {
            e.preventDefault();
            this.calculate();
        });
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebtCalculator;
} else {
    window.DebtCalculator = DebtCalculator;
}
