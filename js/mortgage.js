class MortgageCalculator {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="input-row">
                    <div class="input-group">
                        <label for="mortgage-amount">Loan Amount ($)</label>
                        <input type="number" id="mortgage-amount" placeholder="300,000">
                    </div>
                    <div class="input-group">
                        <label for="down-payment">Down Payment ($)</label>
                        <input type="number" id="down-payment" placeholder="60,000">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="interest-rate">Interest Rate (%)</label>
                        <input type="number" id="interest-rate" placeholder="3.5" step="0.01">
                    </div>
                    <div class="input-group">
                        <label for="loan-term">Loan Term (years)</label>
                        <select id="loan-term">
                            <option value="10">10 years</option>
                            <option value="15">15 years</option>
                            <option value="20">20 years</option>
                            <option value="25">25 years</option>
                            <option value="30" selected>30 years</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="property-tax">Property Tax ($/year)</label>
                        <input type="number" id="property-tax" placeholder="3,600">
                    </div>
                    <div class="input-group">
                        <label for="home-insurance">Home Insurance ($/year)</label>
                        <input type="number" id="home-insurance" placeholder="1,200">
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="pmi">PMI Rate (%)</label>
                    <input type="number" id="pmi" placeholder="0.5" step="0.01" value="0.5">
                </div>
                
                <div class="input-group">
                    <label for="start-date">Loan Start Date</label>
                    <input type="date" id="start-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <button id="calculate-mortgage" class="button cta-button">
                    <i class="fas fa-calculator"></i> Calculate Mortgage
                </button>
                
                <div id="mortgage-results" class="results-container" style="display: none;">
                    <div class="results-header">
                        <div class="calculator-title-container">
                            <div class="calculator-title">
                                <i class="fas fa-home"></i>
                                <h2>Mortgage Analysis</h2>
                            </div>
                        </div>
                        <button id="view-amortization" class="button card-button">
                            <i class="fas fa-table"></i> View Amortization Schedule
                        </button>
                    </div>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Loan Amount</h4>
                            <p id="loan-amount-result">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Down Payment</h4>
                            <p id="down-payment-result">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Loan-to-Value</h4>
                            <p id="ltv-ratio">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Monthly Payment</h4>
                            <p id="monthly-payment">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Principal & Interest</h4>
                            <p id="principal-interest">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Taxes & Insurance</h4>
                            <p id="taxes-insurance">-</p>
                        </div>
                        <div class="result-item">
                            <h4>PMI</h4>
                            <p id="pmi-payment">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Interest</h4>
                            <p id="total-interest">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Cost</h4>
                            <p id="total-cost">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Payoff Date</h4>
                            <p id="payoff-date">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="mortgage-chart"></canvas>
                    </div>
                </div>
                
                <div id="amortization-schedule" class="amortization-container" style="display: none;">
                    <div class="amortization-header">
                        <div class="calculator-title-container">
                            <div class="calculator-title">
                                <i class="fas fa-table"></i>
                                <h2>Amortization Schedule</h2>
                            </div>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payment #</th>
                                    <th>Date</th>
                                    <th>Payment</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Total Interest</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody id="amortization-body">
                            </tbody>
                        </table>
                    </div>
                    <button id="back-to-results" class="button back-button">
                        <i class="fas fa-arrow-left"></i> Back to Results
                    </button>
                </div>
            </div>
        `;

        // Add dynamic styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .calculator-title-container {
                text-align: center;
                margin-bottom: 25px;
            }
            .calculator-title {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                color: var(--primary-color);
            }
            .calculator-title h2 {
                margin: 0;
                color: var(--dark-color);
                font-weight: 600;
                font-size: 1.8rem;
            }
            .calculator-title i {
                font-size: 1.8rem;
            }
            .results-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .amortization-header {
                text-align: center;
                margin-bottom: 25px;
            }
        `;
        document.head.appendChild(style);
    }

    calculate() {
        // Get input values
        const amount = parseFloat(document.getElementById('mortgage-amount').value) || 300000;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 60000;
        const rate = parseFloat(document.getElementById('interest-rate').value) || 3.5;
        const term = parseInt(document.getElementById('loan-term').value) || 30;
        const propertyTax = parseFloat(document.getElementById('property-tax').value) || 3600;
        const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 1200;
        const pmiRate = parseFloat(document.getElementById('pmi').value) || 0.5;
        const startDate = new Date(document.getElementById('start-date').value);
        
        // Calculate loan details
        const loanAmount = amount - downPayment;
        const ltvRatio = (loanAmount / amount) * 100;
        const monthlyRate = rate / 100 / 12;
        const payments = term * 12;
        
        // Calculate PMI (if LTV > 80%)
        let pmiPayment = 0;
        if (ltvRatio > 80) {
            pmiPayment = (loanAmount * (pmiRate / 100)) / 12;
        }
        
        // Calculate monthly payment
        const monthlyPandI = loanAmount * monthlyRate * 
            Math.pow(1 + monthlyRate, payments) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
        
        const monthlyTax = propertyTax / 12;
        const monthlyInsurance = homeInsurance / 12;
        const monthlyPayment = monthlyPandI + monthlyTax + monthlyInsurance + pmiPayment;
        
        // Calculate total costs
        const totalInterest = (monthlyPandI * payments) - loanAmount;
        const totalCost = loanAmount + totalInterest + (propertyTax * term) + (homeInsurance * term) + (pmiPayment * 12 * (ltvRatio > 80 ? term : 0));
        
        // Calculate payoff date
        const payoffDate = new Date(startDate);
        payoffDate.setMonth(payoffDate.getMonth() + payments);
        
        // Display results
        document.getElementById('loan-amount-result').textContent = `$${loanAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('down-payment-result').textContent = `$${downPayment.toLocaleString('en-US', {maximumFractionDigits: 0})} (${(downPayment/amount*100).toFixed(1)}%)`;
        document.getElementById('ltv-ratio').textContent = `${ltvRatio.toFixed(1)}%`;
        document.getElementById('monthly-payment').textContent = `$${monthlyPayment.toFixed(2)}`;
        document.getElementById('principal-interest').textContent = `$${monthlyPandI.toFixed(2)}`;
        document.getElementById('taxes-insurance').textContent = `$${(monthlyTax + monthlyInsurance).toFixed(2)}`;
        document.getElementById('pmi-payment').textContent = pmiPayment ? `$${pmiPayment.toFixed(2)}` : '$0.00';
        document.getElementById('total-interest').textContent = `$${totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('total-cost').textContent = `$${totalCost.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Generate amortization schedule
        this.generateAmortizationSchedule(loanAmount, monthlyRate, payments, monthlyPandI, startDate);
        
        // Generate chart
        this.generateChart(loanAmount, totalInterest, propertyTax * term, homeInsurance * term, pmiPayment * 12 * (ltvRatio > 80 ? term : 0));
        
        // Show results
        document.getElementById('mortgage-results').style.display = 'block';
    }

    generateAmortizationSchedule(loanAmount, monthlyRate, payments, monthlyPayment, startDate) {
        let balance = loanAmount;
        let totalInterestPaid = 0;
        const amortizationBody = document.getElementById('amortization-body');
        amortizationBody.innerHTML = '';
        
        for (let i = 1; i <= payments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            totalInterestPaid += interestPayment;
            balance -= principalPayment;
            
            if (balance < 0) balance = 0;
            
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);
            
            // Only show every 12th payment for brevity (full schedule would be too long)
            if (i % 12 === 0 || i === 1 || i === payments) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${i}</td>
                    <td>${paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td>$${monthlyPayment.toFixed(2)}</td>
                    <td>$${principalPayment.toFixed(2)}</td>
                    <td>$${interestPayment.toFixed(2)}</td>
                    <td>$${totalInterestPaid.toFixed(2)}</td>
                    <td>$${balance.toFixed(2)}</td>
                `;
                amortizationBody.appendChild(row);
            }
        }
    }

    generateChart(principal, interest, taxes, insurance, pmi) {
        const ctx = document.getElementById('mortgage-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest', 'Taxes', 'Insurance', 'PMI'],
                datasets: [{
                    data: [principal, interest, taxes, insurance, pmi],
                    backgroundColor: [
                        '#4361ee',
                        '#3a0ca3',
                        '#f72585',
                        '#4cc9f0',
                        '#4895ef'
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
        document.getElementById('calculate-mortgage').addEventListener('click', () => this.calculate());
        
        document.getElementById('view-amortization').addEventListener('click', () => {
            document.getElementById('mortgage-results').style.display = 'none';
            document.getElementById('amortization-schedule').style.display = 'block';
        });
        
        document.getElementById('back-to-results').addEventListener('click', () => {
            document.getElementById('amortization-schedule').style.display = 'none';
            document.getElementById('mortgage-results').style.display = 'block';
        });
    }
}
