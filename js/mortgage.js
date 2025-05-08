// mortgage.js
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
                <h3>Loan Details</h3>
                <div class="input-group">
                    <label for="home-price">Home Price ($)</label>
                    <input type="number" id="home-price" value="300000" min="0" step="1000">
                </div>
                
                <div class="input-group">
                    <label for="down-payment">Down Payment ($)</label>
                    <input type="number" id="down-payment" value="60000" min="0" step="1000">
                </div>
                
                <div class="input-group">
                    <label for="down-payment-percent">Down Payment (%)</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="range" id="down-payment-percent" min="0" max="100" value="20" step="1" style="flex: 1;">
                        <span id="down-payment-percent-value" style="min-width: 50px; text-align: center; background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">20%</span>
                    </div>
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
                
                <div class="input-group">
                    <label for="interest-rate">Interest Rate (%)</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="range" id="interest-rate" min="1" max="10" value="3.5" step="0.1" style="flex: 1;">
                        <span id="interest-rate-value" style="min-width: 50px; text-align: center; background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">3.5%</span>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="start-date">Start Date</label>
                    <input type="date" id="start-date">
                </div>
                
                <button id="calculate-mortgage" class="button cta-button">Calculate</button>
                <button id="toggle-advanced" class="button card-button" style="width: 100%; margin-top: 10px;">
                    <i class="fas fa-chevron-down"></i> Advanced Options
                </button>
                
                <div id="advanced-options" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <div class="input-group">
                        <label for="property-tax">Annual Property Tax ($)</label>
                        <input type="number" id="property-tax" value="3000" min="0" step="100">
                    </div>
                    
                    <div class="input-group">
                        <label for="home-insurance">Annual Home Insurance ($)</label>
                        <input type="number" id="home-insurance" value="1200" min="0" step="100">
                    </div>
                    
                    <div class="input-group">
                        <label for="pmi">PMI (%)</label>
                        <input type="number" id="pmi" value="0.5" min="0" max="2" step="0.1">
                    </div>
                    
                    <div class="input-group">
                        <label for="hoa">Monthly HOA Fees ($)</label>
                        <input type="number" id="hoa" value="0" min="0" step="10">
                    </div>
                    
                    <div class="input-group">
                        <label for="extra-payment">Extra Monthly Payment ($)</label>
                        <input type="number" id="extra-payment" value="0" min="0" step="10">
                    </div>
                </div>
            </div>
            
            <div id="mortgage-results" class="results-container" style="display: none; margin-top: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Mortgage Summary</h3>
                    <div>
                        <button id="print-results" class="button back-button" style="margin-left: 10px;">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button id="export-results" class="button back-button" style="margin-left: 10px;">
                            <i class="fas fa-file-export"></i> Export
                        </button>
                    </div>
                </div>
                
                <div class="results-grid">
                    <div class="result-item" style="background-color: rgba(67, 97, 238, 0.1);">
                        <h4>Monthly Payment</h4>
                        <p id="monthly-payment" style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">$1,347.13</p>
                    </div>
                    <div class="result-item">
                        <h4>Total Interest</h4>
                        <p id="total-interest">$179,674.42</p>
                    </div>
                    <div class="result-item">
                        <h4>Payoff Date</h4>
                        <p id="payoff-date">May 2053</p>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h4>Payment Breakdown</h4>
                    <div style="height: 300px; margin-top: 20px;">
                        <canvas id="payment-chart"></canvas>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <div style="display: flex; border-bottom: 1px solid #ddd; margin-bottom: 20px;">
                        <button class="tab-button active" data-tab="amortization">Amortization</button>
                        <button class="tab-button" data-tab="summary">Summary</button>
                        <button class="tab-button" data-tab="compare">Compare</button>
                    </div>
                    
                    <div id="amortization-tab" class="tab-content active">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left;">Year</th>
                                    <th style="padding: 12px; text-align: left;">Principal</th>
                                    <th style="padding: 12px; text-align: left;">Interest</th>
                                    <th style="padding: 12px; text-align: left;">Taxes & Fees</th>
                                    <th style="padding: 12px; text-align: left;">Total Payment</th>
                                    <th style="padding: 12px; text-align: left;">Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody id="amortization-body">
                                <!-- Amortization data will be populated here -->
                            </tbody>
                        </table>
                        <div style="display: flex; justify-content: center; gap: 5px; margin-top: 20px;">
                            <button id="prev-page" class="button back-button">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="button back-button active">1</button>
                            <button class="button back-button">2</button>
                            <button class="button back-button">3</button>
                            <button class="button back-button">4</button>
                            <button class="button back-button">5</button>
                            <button id="next-page" class="button back-button">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="summary-tab" class="tab-content" style="display: none;">
                        <h4>Loan Summary</h4>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Loan Amount</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="loan-amount">$240,000.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Total Interest Paid</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="summary-total-interest">$179,674.42</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Total Cost of Loan</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="total-cost">$419,674.42</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Payoff Date</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="summary-payoff-date">May 2053</td>
                            </tr>
                        </table>
                        
                        <h4 style="margin-top: 20px;">Payment Breakdown</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Principal & Interest</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="principal-interest">$1,078.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Property Tax</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="monthly-tax">$250.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">Home Insurance</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="monthly-insurance">$100.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">PMI</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="monthly-pmi">$0.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">HOA Fees</td>
                                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;" id="monthly-hoa">$0.00</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: 600;">Total Monthly Payment</td>
                                <td style="padding: 12px; font-weight: 600; text-align: right;" id="summary-monthly-payment">$1,347.13</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div id="compare-tab" class="tab-content" style="display: none;">
                        <h4>Compare Loan Options</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left;">Term</th>
                                    <th style="padding: 12px; text-align: left;">Rate</th>
                                    <th style="padding: 12px; text-align: left;">Monthly Payment</th>
                                    <th style="padding: 12px; text-align: left;">Total Interest</th>
                                    <th style="padding: 12px; text-align: left;">Savings</th>
                                </tr>
                            </thead>
                            <tbody id="compare-body">
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">15-year</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">2.75%</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$1,627.27</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$52,860.00</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$126,814.42</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">20-year</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">3.00%</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$1,331.00</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$79,440.00</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$100,234.42</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">30-year</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">3.50%</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$1,078.00</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$179,674.42</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">$0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Initialize date field with today's date
        document.getElementById('start-date').valueAsDate = new Date();
        
        // Initialize chart
        this.initChart();
    }

    initChart() {
        const ctx = document.getElementById('payment-chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest', 'Taxes', 'Insurance', 'PMI', 'HOA'],
                datasets: [{
                    data: [1078, 400, 250, 100, 0, 0],
                    backgroundColor: [
                        '#4361ee',
                        '#e63946',
                        '#2a9d8f',
                        '#f4a261',
                        '#9b5de5',
                        '#00b4d8'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Toggle advanced options
        document.getElementById('toggle-advanced').addEventListener('click', () => {
            const advancedOptions = document.getElementById('advanced-options');
            const icon = document.getElementById('toggle-advanced').querySelector('i');
            
            if (advancedOptions.style.display === 'none') {
                advancedOptions.style.display = 'block';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                advancedOptions.style.display = 'none';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });

        // Range inputs
        document.getElementById('down-payment-percent').addEventListener('input', () => {
            const percent = document.getElementById('down-payment-percent').value;
            document.getElementById('down-payment-percent-value').textContent = `${percent}%`;
            
            const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
            document.getElementById('down-payment').value = Math.round(homePrice * (percent / 100));
        });

        document.getElementById('interest-rate').addEventListener('input', () => {
            const rate = document.getElementById('interest-rate').value;
            document.getElementById('interest-rate-value').textContent = `${rate}%`;
        });

        // Down payment sync between $ and %
        document.getElementById('down-payment').addEventListener('input', () => {
            const homePrice = parseFloat(document.getElementById('home-price').value) || 1;
            const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
            const percent = Math.round((downPayment / homePrice) * 100);
            
            document.getElementById('down-payment-percent').value = percent;
            document.getElementById('down-payment-percent-value').textContent = `${percent}%`;
        });

        // Calculate button
        document.getElementById('calculate-mortgage').addEventListener('click', () => {
            this.calculateMortgage();
        });

        // Print and export buttons
        document.getElementById('print-results').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('export-results').addEventListener('click', () => {
            alert('Export functionality would be implemented here. This is just a demo.');
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
                
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).style.display = 'block';
            });
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            // In a full implementation, this would navigate to the previous page of amortization data
            alert('Previous page would be implemented in a full version.');
        });

        document.getElementById('next-page').addEventListener('click', () => {
            // In a full implementation, this would navigate to the next page of amortization data
            alert('Next page would be implemented in a full version.');
        });
    }

    calculateMortgage() {
        // Get input values
        const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
        const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0.035;
        const startDate = new Date(document.getElementById('start-date').value);
        const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
        const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 0;
        const pmiRate = parseFloat(document.getElementById('pmi').value) / 100 || 0;
        const hoa = parseFloat(document.getElementById('hoa').value) || 0;
        const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;

        // Calculate loan amount
        const loanAmount = homePrice - downPayment;
        
        // Calculate monthly interest rate
        const monthlyInterestRate = interestRate / 12;
        
        // Calculate number of payments
        const numberOfPayments = loanTerm * 12;
        
        // Calculate monthly payment (principal + interest)
        const monthlyPaymentPI = loanAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        
        // Calculate PMI (if down payment is less than 20%)
        const pmi = (downPayment < homePrice * 0.2) ? 
            (loanAmount * pmiRate) / 12 : 0;
        
        // Calculate monthly taxes and insurance
        const monthlyTaxes = propertyTax / 12;
        const monthlyInsurance = homeInsurance / 12;
        
        // Calculate total monthly payment
        const totalMonthlyPayment = monthlyPaymentPI + monthlyTaxes + monthlyInsurance + pmi + hoa + extraPayment;
        
        // Calculate total interest
        const totalInterest = (monthlyPaymentPI * numberOfPayments) - loanAmount;
        
        // Calculate payoff date
        const payoffDate = new Date(startDate);
        payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
        
        // Update results display
        this.updateResults(
            totalMonthlyPayment,
            monthlyPaymentPI,
            monthlyTaxes,
            monthlyInsurance,
            pmi,
            hoa,
            totalInterest,
            loanAmount,
            payoffDate
        );
        
        // Show results
        document.getElementById('mortgage-results').style.display = 'block';
    }

    updateResults(
        totalMonthlyPayment,
        monthlyPaymentPI,
        monthlyTaxes,
        monthlyInsurance,
        pmi,
        hoa,
        totalInterest,
        loanAmount,
        payoffDate
    ) {
        // Update summary cards
        document.getElementById('monthly-payment').textContent = `$${totalMonthlyPayment.toFixed(2)}`;
        document.getElementById('total-interest').textContent = `$${totalInterest.toFixed(2)}`;
        document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Update summary tab
        document.getElementById('loan-amount').textContent = `$${loanAmount.toFixed(2)}`;
        document.getElementById('summary-total-interest').textContent = `$${totalInterest.toFixed(2)}`;
        document.getElementById('total-cost').textContent = `$${(loanAmount + totalInterest).toFixed(2)}`;
        document.getElementById('summary-payoff-date').textContent = payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Update payment breakdown
        document.getElementById('principal-interest').textContent = `$${monthlyPaymentPI.toFixed(2)}`;
        document.getElementById('monthly-tax').textContent = `$${monthlyTaxes.toFixed(2)}`;
        document.getElementById('monthly-insurance').textContent = `$${monthlyInsurance.toFixed(2)}`;
        document.getElementById('monthly-pmi').textContent = `$${pmi.toFixed(2)}`;
        document.getElementById('monthly-hoa').textContent = `$${hoa.toFixed(2)}`;
        document.getElementById('summary-monthly-payment').textContent = `$${totalMonthlyPayment.toFixed(2)}`;
        
        // Update chart
        this.updateChart(
            monthlyPaymentPI,
            (totalMonthlyPayment - monthlyPaymentPI - monthlyTaxes - monthlyInsurance - pmi - hoa),
            monthlyTaxes,
            monthlyInsurance,
            pmi,
            hoa
        );
    }

    updateChart(principal, interest, taxes, insurance, pmi, hoa) {
        this.chart.data.datasets[0].data = [
            principal.toFixed(2),
            interest.toFixed(2),
            taxes.toFixed(2),
            insurance.toFixed(2),
            pmi.toFixed(2),
            hoa.toFixed(2)
        ];
        this.chart.update();
    }
}
