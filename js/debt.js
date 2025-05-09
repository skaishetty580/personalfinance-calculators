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
                
                <div id="loading-indicator" style="display: none;">
                    <p>Calculating... This may take a moment for large debts.</p>
                    <progress id="calc-progress" value="0" max="100"></progress>
                </div>
                
                <div id="debt-results" class="results-container" style="display: none;">
                    <!-- Results content remains the same -->
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
        
        debtEntry.querySelector('.remove-debt').addEventListener('click', (e) => {
            e.preventDefault();
            debtEntry.remove();
            
            if (document.querySelectorAll('.debt-entry').length === 1) {
                document.querySelector('.remove-debt').style.display = 'none';
            }
        });
    }

    async calculate() {
        // Validate inputs first
        if (!this.validateInputs()) return;

        // Show loading state
        this.showLoading(true);

        try {
            // Process debts
            this.processDebts();
            
            // Get payoff method and extra payment
            const method = document.getElementById('payoff-method').value;
            const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
            
            // Sort debts
            this.sortDebts(method);
            
            // Calculate payoff plan with progress updates
            const result = await this.calculateWithProgress(extraPayment);
            
            // Display results
            this.displayResults(result);
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Calculation failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    validateInputs() {
        let hasValidDebt = false;
        const debtEntries = document.querySelectorAll('.debt-entry');
        
        debtEntries.forEach((entry) => {
            const balance = parseFloat(entry.querySelector('.debt-balance').value) || 0;
            const payment = parseFloat(entry.querySelector('.debt-payment').value) || 0;
            
            if (balance > 0 && payment > 0) {
                hasValidDebt = true;
            }
        });
        
        if (!hasValidDebt) {
            alert('Please enter at least one valid debt with balance and payment');
            return false;
        }
        
        return true;
    }

    processDebts() {
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
    }

    sortDebts(method) {
        if (method === 'avalanche') {
            this.debts.sort((a, b) => b.rate - a.rate || a.balance - b.balance);
        } else { // snowball
            this.debts.sort((a, b) => a.balance - b.balance || b.rate - a.rate);
        }
    }

    calculateWithProgress(extraPayment) {
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
                        // Update progress
                        const progress = Math.min(100, Math.floor((result.months / this.maxMonths) * 100);
                        document.getElementById('calc-progress').value = progress;
                        
                        // Schedule next chunk
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

    showLoading(show) {
        const calculateBtn = document.getElementById('calculate-debt');
        const loadingIndicator = document.getElementById('loading-indicator');
        const results = document.getElementById('debt-results');
        
        if (show) {
            calculateBtn.disabled = true;
            loadingIndicator.style.display = 'block';
            results.style.display = 'none';
            document.getElementById('calc-progress').value = 0;
        } else {
            calculateBtn.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }

    displayResults(result) {
        document.getElementById('total-debt').textContent = `$${result.totalDebt.toLocaleString('en-US')}`;
        document.getElementById('total-interest').textContent = `$${result.totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('payoff-time').textContent = `${result.months} months (${(result.months/12).toFixed(1)} years)`;
        document.getElementById('total-paid').textContent = `$${result.totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        
        this.generatePayoffPlanTable(result.payoffPlan);
        this.generateChart(result.totalDebt, result.totalInterest);
        document.getElementById('debt-results').style.display = 'block';
    }

    generatePayoffPlanTable(plan) {
        const payoffBody = document.getElementById('payoff-body');
        payoffBody.innerHTML = '';
        
        // Show every 6 months and important milestones
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
                <td>$${Math.max(0, item.remaining).toFixed(2)}</td>
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
                    backgroundColor: ['#4361ee', '#f72585'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
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
