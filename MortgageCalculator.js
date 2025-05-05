class MortgageCalculator {
    constructor(container) {
        this.container = container;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="input-row">
                    <div class="input-group">
                        <label for="mortgage-amount">Loan Amount ($)</label>
                        <input type="number" id="mortgage-amount" placeholder="300,000" min="0">
                    </div>
                    <div class="input-group">
                        <label for="down-payment">Down Payment ($)</label>
                        <input type="number" id="down-payment" placeholder="60,000" min="0">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="interest-rate">Interest Rate (%)</label>
                        <input type="number" id="interest-rate" placeholder="3.5" step="0.01" min="0" max="20">
                    </div>
                    <div class="input-group">
                        <label for="loan-term">Loan Term (years)</label>
                        <select id="loan-term">
                            <option value="10">10 years</option>
                            <option value="15">15 years</option>
                            <option value="20">20 years</option>
                            <option value="30" selected>30 years</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="property-tax">Annual Property Tax ($)</label>
                        <input type="number" id="property-tax" placeholder="3,600" min="0">
                    </div>
                    <div class="input-group">
                        <label for="insurance">Annual Home Insurance ($)</label>
                        <input type="number" id="insurance" placeholder="1,200" min="0">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="pmi-rate">PMI Rate (%)</label>
                        <input type="number" id="pmi-rate" placeholder="0.5" step="0.01" min="0" max="2">
                    </div>
                    <div class="input-group">
                        <label for="start-date">Start Date</label>
                        <input type="month" id="start-date">
                    </div>
                </div>
                
                <button id="calculate-mortgage" class="calculate-btn">Calculate Mortgage</button>
            </div>
            
            <div id="mortgage-results" class="results-container" style="display: none;">
                <h3 class="results-title">Mortgage Results</h3>
                <div id="mortgage-summary" class="summary-grid"></div>
                
                <div class="results-section">
                    <h4>Amortization Schedule</h4>
                    <div class="table-container">
                        <table id="amortization-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Payment</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Taxes/Ins</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                
                <div class="chart-container">
                    <canvas id="amortization-chart"></canvas>
                </div>
            </div>
        `;
        
        // Set default start date to current month
        const today = new Date();
        document.getElementById('start-date').value = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        document.getElementById('calculate-mortgage').addEventListener('click', () => this.calculate());
    }

    calculate() {
        // Get input values
        const loanAmount = parseFloat(document.getElementById('mortgage-amount').value) || 0;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
        const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
        const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
        const insurance = parseFloat(document.getElementById('insurance').value) || 0;
        const pmiRate = parseFloat(document.getElementById('pmi-rate').value) || 0;
        const startDate = new Date(document.getElementById('start-date').value);
        
        // Calculate loan details
        const principal = loanAmount - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const payments = loanTerm * 12;
        
        // Calculate monthly payment
        const monthlyPayment = principal * monthlyRate * 
            Math.pow(1 + monthlyRate, payments) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
        
        // Calculate PMI (if applicable)
        const pmi = (principal > loanAmount * 0.8) ? (principal * pmiRate / 100 / 12) : 0;
        
        // Calculate escrow
        const escrow = (propertyTax + insurance) / 12;
        const totalMonthly = monthlyPayment + pmi + escrow;
        
        // Generate amortization schedule
        let balance = principal;
        let totalInterest = 0;
        let amortizationHTML = '';
        const monthlyData = [];
        const labels = [];
        const principalData = [];
        const interestData = [];
        
        for (let month = 1; month <= payments; month++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            totalInterest += interest;
            
            // Add to chart data (every 12 months)
            if (month % 12 === 0 || month === 1 || month === payments) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + month);
                labels.push(date.toLocaleDateString('default', {month: 'short', year: 'numeric'}));
                principalData.push(principalPayment);
                interestData.push(interest);
            }
            
            // Add to table (first 5 months, last 5 months, and yearly)
            if (month <= 5 || month >= payments - 5 || month % 12 === 0) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + month);
                
                amortizationHTML += `
                    <tr>
                        <td>${date.toLocaleDateString('default', {month: 'short', year: 'numeric'})}</td>
                        <td>$${totalMonthly.toFixed(2)}</td>
                        <td>$${principalPayment.toFixed(2)}</td>
                        <td>$${interest.toFixed(2)}</td>
                        <td>$${escrow.toFixed(2)}</td>
                        <td>$${Math.max(0, balance).toFixed(2)}</td>
                    </tr>
                `;
            }
            
            if (balance <= 0) break;
        }
        
        // Display results
        document.getElementById('mortgage-summary').innerHTML = `
            <div class="summary-card">
                <h4>Monthly Payment</h4>
                <p class="summary-value">$${totalMonthly.toFixed(2)}</p>
                <div class="breakdown">
                    <span>Principal & Interest: $${monthlyPayment.toFixed(2)}</span>
                    <span>Taxes & Insurance: $${escrow.toFixed(2)}</span>
                    ${pmi > 0 ? `<span>PMI: $${pmi.toFixed(2)}</span>` : ''}
                </div>
            </div>
            <div class="summary-card">
                <h4>Total Interest</h4>
                <p class="summary-value">$${totalInterest.toFixed(2)}</p>
            </div>
            <div class="summary-card">
                <h4>Total Cost</h4>
                <p class="summary-value">$${(principal + totalInterest + (propertyTax * loanTerm) + (insurance * loanTerm)).toFixed(2)}</p>
            </div>
            <div class="summary-card">
                <h4>Payoff Date</h4>
                <p class="summary-value">${new Date(startDate.setMonth(startDate.getMonth() + payments)).toLocaleDateString('default', {month: 'long', year: 'numeric'})}</p>
            </div>
        `;
        
        document.querySelector('#amortization-table tbody').innerHTML = amortizationHTML;
        
        // Create chart
        this.createAmortizationChart(labels, principalData, interestData);
        
        // Show results
        document.getElementById('mortgage-results').style.display = 'block';
    }

    createAmortizationChart(labels, principalData, interestData) {
        const ctx = document.getElementById('amortization-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.amortizationChart) {
            this.amortizationChart.destroy();
        }
        
        this.amortizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Principal',
                        data: principalData,
                        backgroundColor: '#4361ee',
                        borderColor: '#3a56d4',
                        borderWidth: 1
                    },
                    {
                        label: 'Interest',
                        data: interestData,
                        backgroundColor: '#f72585',
                        borderColor: '#d3166a',
                        borderWidth: 1
                    }
                ]
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
