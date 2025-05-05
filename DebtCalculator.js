class DebtCalculator {
    constructor(container) {
        this.container = container;
        this.debts = [];
        this.debtCounter = 1;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div id="debt-inputs">
                    <div class="debt-item">
                        <h4>Debt #1</h4>
                        <div class="input-row">
                            <div class="input-group">
                                <label>Debt Name</label>
                                <input type="text" class="debt-name" placeholder="Credit Card" required>
                            </div>
                            <div class="input-group">
                                <label>Balance ($)</label>
                                <input type="number" class="debt-balance" placeholder="5,000" min="0" required>
                            </div>
                        </div>
                        <div class="input-row">
                            <div class="input-group">
                                <label>Interest Rate (%)</label>
                                <input type="number" class="debt-rate" placeholder="18.99" step="0.01" min="0" max="100" required>
                            </div>
                            <div class="input-group">
                                <label>Minimum Payment ($)</label>
                                <input type="number" class="debt-min-payment" placeholder="100" min="0" required>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="button-group">
                    <button type="button" id="add-debt" class="secondary-btn">
                        <i class="fas fa-plus"></i> Add Another Debt
                    </button>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="debt-payment">Monthly Payment Available ($)</label>
                        <input type="number" id="debt-payment" placeholder="500" min="0" required>
                    </div>
                    <div class="input-group">
                        <label for="debt-strategy">Payoff Strategy</label>
                        <select id="debt-strategy">
                            <option value="avalanche">Avalanche (Highest Interest First)</option>
                            <option value="snowball">Snowball (Smallest Balance First)</option>
                        </select>
                    </div>
                </div>
                
                <button id="calculate-debt" class="calculate-btn">Calculate Payoff Plan</button>
            </div>
            
            <div id="debt-results" class="results-container" style="display: none;">
                <h3 class="results-title">Debt Payoff Plan</h3>
                <div id="debt-summary" class="summary-grid"></div>
                
                <div class="results-section">
                    <h4>Payoff Timeline</h4>
                    <div class="chart-container">
                        <canvas id="debt-chart"></canvas>
                    </div>
                </div>
                
                <div class="results-section">
                    <h4>Payment Schedule</h4>
                    <div class="table-container">
                        <table id="debt-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Debt</th>
                                    <th>Payment</th>
                                    <th>Interest</th>
                                    <th>Principal</th>
                                    <th>Remaining</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('add-debt').addEventListener('click', () => this.addDebt());
        document.getElementById('calculate-debt').addEventListener('click', () => this.calculate());
    }

    addDebt() {
        this.debtCounter++;
        const newDebt = document.createElement('div');
        newDebt.className = 'debt-item';
        newDebt.innerHTML = `
            <h4>Debt #${this.debtCounter}</h4>
            <div class="input-row">
                <div class="input-group">
                    <label>Debt Name</label>
                    <input type="text" class="debt-name" placeholder="Credit Card" required>
                </div>
                <div class="input-group">
                    <label>Balance ($)</label>
                    <input type="number" class="debt-balance" placeholder="5,000" min="0" required>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Interest Rate (%)</label>
                    <input type="number" class="debt-rate" placeholder="18.99" step="0.01" min="0" max="100" required>
                </div>
                <div class="input-group">
                    <label>Minimum Payment ($)</label>
                    <input type="number" class="debt-min-payment" placeholder="100" min="0" required>
                </div>
            </div>
            <button type="button" class="remove-debt secondary-btn">
                <i class="fas fa-trash"></i> Remove Debt
            </button>
        `;
        
        document.getElementById('debt-inputs').appendChild(newDebt);
        
        // Add event listener to remove button
        newDebt.querySelector('.remove-debt').addEventListener('click', () => {
            newDebt.remove();
            this.debtCounter--;
            // Renumber remaining debts
            document.querySelectorAll('.debt-item').forEach((item, index) => {
                item.querySelector('h4').textContent = `Debt #${index + 1}`;
            });
        });
    }

    calculate() {
        // Get all debts
        this.debts = [];
        document.querySelectorAll('.debt-item').forEach((item, index) => {
            const name = item.querySelector('.debt-name').value || `Debt ${index + 1}`;
            const balance = parseFloat(item.querySelector('.debt-balance').value) || 0;
            const rate = parseFloat(item.querySelector('.debt-rate').value) || 0;
            const minPayment = parseFloat(item.querySelector('.debt-min-payment').value) || 0;
            
            if (balance > 0) {
                this.debts.push({
                    name,
                    balance,
                    rate,
                    minPayment,
                    remaining: balance,
                    paid: false,
                    interestPaid: 0
                });
            }
        });
        
        if (this.debts.length === 0) {
            alert('Please enter at least one debt');
            return;
        }
        
        const monthlyPayment = parseFloat(document.getElementById('debt-payment').value) || 0;
        const strategy = document.getElementById('debt-strategy').value;
        
        if (monthlyPayment === 0) {
            alert('Please enter a monthly payment amount');
            return;
        }
        
        // Sort debts based on strategy
        if (strategy === 'avalanche') {
            this.debts.sort((a, b) => b.rate - a.rate);
        } else {
            this.debts.sort((a, b) => a.balance - b.balance);
        }
        
        // Create copies to work with
        const workingDebts = JSON.parse(JSON.stringify(this.debts));
        let months = 0;
        let totalInterest = 0;
        const timeline = [];
        const debtNames = workingDebts.map(debt => debt.name);
        const payoffMonths = Array(workingDebts.length).fill(0);
        const monthlyData = [];
        
        while (workingDebts.some(debt => !debt.paid) && months < 600) { // 50 year limit
            months++;
            let remainingPayment = monthlyPayment;
            const monthResult = {
                month,
                payments: [],
                totalPaid: 0,
                interestPaid: 0
            };
            
            // Pay minimums first
            for (const debt of workingDebts) {
                if (debt.paid || remainingPayment <= 0) continue;
                
                const interest = debt.remaining * (debt.rate / 100 / 12);
                const payment = Math.min(debt.minPayment + (debt === workingDebts.find(d => !d.paid) ? remainingPayment - debt.minPayment : 0), debt.remaining + interest);
                const principal = payment - interest;
                
                debt.remaining -= principal;
                debt.interestPaid += interest;
                monthResult.interestPaid += interest;
                monthResult.totalPaid += payment;
                remainingPayment -= payment;
                
                monthResult.payments.push({
                    name: debt.name,
                    payment,
                    interest,
                    principal,
                    remaining: debt.remaining
                });
                
                if (debt.remaining <= 0) {
                    debt.paid = true;
                    payoffMonths[workingDebts.indexOf(debt)] = months;
                }
            }
            
            totalInterest += monthResult.interestPaid;
            
            // Add to timeline (every 6 months or when debts are paid)
            if (months % 6 === 0 || months === 1 || workingDebts.every(debt => debt.paid)) {
                timeline.push(monthResult);
                
                // Add to chart data
                const monthData = {
                    month,
                    remaining: {}
                };
                
                workingDebts.forEach(debt => {
                    monthData.remaining[debt.name] = debt.paid ? 0 : debt.remaining;
                });
                
                monthlyData.push(monthData);
            }
            
            if (workingDebts.every(debt => debt.paid)) break;
        }
        
        // Calculate interest if only minimum payments were made
        const minPaymentInterest = this.calculateMinPaymentInterest();
        
        // Display results
        document.getElementById('debt-summary').innerHTML = `
            <div class="summary-card">
                <h4>Total Months to Payoff</h4>
                <p class="summary-value">${months}</p>
                <div class="breakdown">
                    <span>${Math.floor(months/12)} years ${months%12} months</span>
                </div>
            </div>
            <div class="summary-card">
                <h4>Total Interest Paid</h4>
                <p class="summary-value">$${totalInterest.toFixed(2)}</p>
                <div class="breakdown">
                    <span>Saved $${(minPaymentInterest - totalInterest).toFixed(2)} vs minimum payments</span>
                </div>
            </div>
            <div class="summary-card">
                <h4>Total Amount Paid</h4>
                <p class="summary-value">$${(this.debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterest).toFixed(2)}</p>
            </div>
            <div class="summary-card">
                <h4>Strategy Used</h4>
                <p class="summary-value">${strategy === 'avalanche' ? 'Avalanche (Highest Interest First)' : 'Snowball (Smallest Balance First)'}</p>
            </div>
        `;
        
        // Generate payment schedule table
        let scheduleHTML = '';
        timeline.forEach(month => {
            month.payments.forEach(payment => {
                scheduleHTML += `
                    <tr>
                        <td>${month.month}</td>
                        <td>${payment.name}</td>
                        <td>$${payment.payment.toFixed(2)}</td>
                        <td>$${payment.interest.toFixed(2)}</td>
                        <td>$${payment.principal.toFixed(2)}</td>
                        <td>$${payment.remaining.toFixed(2)}</td>
                    </tr>
                `;
            });
        });
        
        document.querySelector('#debt-table tbody').innerHTML = scheduleHTML;
        
        // Create chart
        this.createDebtChart(monthlyData, debtNames);
        
        // Show results
        document.getElementById('debt-results').style.display = 'block';
    }

    calculateMinPaymentInterest() {
        let totalInterest = 0;
        const debts = JSON.parse(JSON.stringify(this.debts));
        let months = 0;
        
        while (debts.some(debt => !debt.paid) && months < 600) {
            months++;
            let monthlyInterest = 0;
            
            for (const debt of debts) {
                if (debt.paid) continue;
                
                const interest = debt.remaining * (debt.rate / 100 / 12);
                const payment = Math.min(debt.minPayment, debt.remaining + interest);
                const principal = payment - interest;
                
                debt.remaining -= principal;
                monthlyInterest += interest;
                
                if (debt.remaining <= 0) {
                    debt.paid = true;
                }
            }
            
            totalInterest += monthlyInterest;
        }
        
        return totalInterest;
    }

    createDebtChart(monthlyData, debtNames) {
        const ctx = document.getElementById('debt-chart').getContext('2d');
        
        // Prepare dataset for each debt
        const datasets = debtNames.map((name, index) => {
            const colors = [
                '#4361ee', '#3f37c9', '#4895ef', '#4cc9f0', 
                '#f72585', '#b5179e', '#7209b7', '#560bad'
            ];
            
            return {
                label: name,
                data: monthlyData.map(data => data.remaining[name]),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                borderWidth: 1
            };
        });
        
        // Destroy previous chart if it exists
        if (this.debtChart) {
            this.debtChart.destroy();
        }
        
        this.debtChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(data => `Month ${data.month}`),
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}
