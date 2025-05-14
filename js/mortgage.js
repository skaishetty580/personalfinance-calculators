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
                        <input type="number" id="interest-rate" placeholder="3.5" step="0.01" min="0" max="25">
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
                        <input type="number" id="property-tax" placeholder="3,600" min="0">
                    </div>
                    <div class="input-group">
                        <label for="home-insurance">Home Insurance ($/year)</label>
                        <input type="number" id="home-insurance" placeholder="1,200" min="0">
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="pmi">PMI Rate (%)</label>
                    <input type="number" id="pmi" placeholder="0.5" step="0.01" value="0.5" min="0" max="2">
                </div>
                
                <div class="input-group">
                    <label for="start-date">Loan Start Date</label>
                    <input type="date" id="start-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <button id="calculate-mortgage" class="button cta-button">
                    <i class="fas fa-calculator"></i> Calculate Mortgage
                </button>
                
                <div id="error-message" class="error-message" style="display: none;"></div>
                
                <div id="mortgage-results" class="results-container" style="display: none;">
                    <div class="results-header">
                        <h3>Mortgage Analysis</h3>
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
                    <h3>Amortization Schedule</h3>
                    <div class="schedule-controls">
                        <button id="show-full-schedule" class="button small-button">Show Full Schedule</button>
                        <button id="show-annual-schedule" class="button small-button active">Show Annual Summary</button>
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
    }

    validateInputs() {
        const amount = this.parseInputValue('mortgage-amount');
        const downPayment = this.parseInputValue('down-payment');
        const rate = this.parseInputValue('interest-rate');
        
        if (amount <= 0) {
            throw new Error('Loan amount must be positive');
        }
        
        if (downPayment < 0) {
            throw new Error('Down payment cannot be negative');
        }
        
        if (downPayment > amount) {
            throw new Error('Down payment cannot exceed loan amount');
        }
        
        if (rate <= 0 || rate > 25) {
            throw new Error('Interest rate must be between 0.01% and 25%');
        }
        
        return true;
    }

    parseInputValue(id) {
        const element = document.getElementById(id);
        const value = element.value.replace(/,/g, '');
        return value ? parseFloat(value) : 0;
    }

    calculate() {
        try {
            this.validateInputs();
            
            // Get input values
            const amount = this.parseInputValue('mortgage-amount');
            const downPayment = this.parseInputValue('down-payment');
            const rate = this.parseInputValue('interest-rate');
            const term = parseInt(document.getElementById('loan-term').value) || 30;
            const propertyTax = this.parseInputValue('property-tax');
            const homeInsurance = this.parseInputValue('home-insurance');
            const pmiRate = this.parseInputValue('pmi');
            const startDate = new Date(document.getElementById('start-date').value);
            
            // Calculate loan details
            const loanAmount = amount - downPayment;
            const ltvRatio = (loanAmount / amount) * 100;
            const monthlyRate = rate / 100 / 12;
            const payments = term * 12;
            
            // Calculate PMI
            let pmiPayment = 0;
            let pmiMonths = 0;
            if (ltvRatio > 80) {
                pmiPayment = (loanAmount * (pmiRate / 100)) / 12;
                // Calculate months until LTV reaches 78%
                pmiMonths = Math.ceil(Math.log(80/ltvRatio) / Math.log(1 + (rate/100/12)));
                pmiMonths = Math.min(pmiMonths, payments);
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
            const totalPMI = pmiPayment * pmiMonths;
            const totalCost = loanAmount + totalInterest + (propertyTax * term) + 
                             (homeInsurance * term) + totalPMI;
            
            // Calculate payoff date
            const payoffDate = new Date(startDate);
            payoffDate.setMonth(payoffDate.getMonth() + payments);
            
            // Display results
            this.displayResults({
                loanAmount,
                downPayment,
                amount,
                ltvRatio,
                monthlyPayment,
                monthlyPandI,
                monthlyTax,
                monthlyInsurance,
                pmiPayment,
                totalInterest,
                totalCost,
                payoffDate,
                term,
                propertyTax,
                homeInsurance,
                totalPMI
            });
            
            // Generate amortization schedule
            this.generateAmortizationSchedule(loanAmount, monthlyRate, payments, monthlyPandI, startDate);
            
            // Generate chart
            this.generateChart(loanAmount, totalInterest, propertyTax * term, 
                             homeInsurance * term, totalPMI);
            
            // Show results
            document.getElementById('mortgage-results').style.display = 'block';
            document.getElementById('error-message').style.display = 'none';
            
        } catch (error) {
            this.showError(error.message);
            console.error(error);
        }
    }

    displayResults(results) {
        const formatCurrency = (value) => `$${value.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        const formatPercent = (value) => `${value.toFixed(1)}%`;
        
        document.getElementById('loan-amount-result').textContent = formatCurrency(results.loanAmount);
        document.getElementById('down-payment-result').textContent = 
            `${formatCurrency(results.downPayment)} (${(results.downPayment/results.amount*100).toFixed(1)}%)`;
        document.getElementById('ltv-ratio').textContent = formatPercent(results.ltvRatio);
        document.getElementById('monthly-payment').textContent = formatCurrency(results.monthlyPayment);
        document.getElementById('principal-interest').textContent = formatCurrency(results.monthlyPandI);
        document.getElementById('taxes-insurance').textContent = 
            formatCurrency(results.monthlyTax + results.monthlyInsurance);
        document.getElementById('pmi-payment').textContent = 
            results.pmiPayment ? formatCurrency(results.pmiPayment) : '$0.00';
        document.getElementById('total-interest').textContent = formatCurrency(results.totalInterest);
        document.getElementById('total-cost').textContent = formatCurrency(results.totalCost);
        document.getElementById('payoff-date').textContent = 
            results.payoffDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
    }

    generateAmortizationSchedule(loanAmount, monthlyRate, payments, monthlyPayment, startDate) {
        let balance = loanAmount;
        let totalInterestPaid = 0;
        const amortizationBody = document.getElementById('amortization-body');
        amortizationBody.innerHTML = '';
        
        // Store all schedule data for filtering
        this.amortizationData = [];
        
        for (let i = 1; i <= payments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            totalInterestPaid += interestPayment;
            balance -= principalPayment;
            
            if (balance < 0) balance = 0;
            
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);
            
            this.amortizationData.push({
                paymentNumber: i,
                date: paymentDate,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                totalInterest: totalInterestPaid,
                balance: balance
            });
        }
        
        // Show annual summary by default
        this.showAnnualAmortization();
    }

    showAnnualAmortization() {
        const amortizationBody = document.getElementById('amortization-body');
        amortizationBody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        // Add first payment
        if (this.amortizationData.length > 0) {
            this.addAmortizationRow(fragment, this.amortizationData[0]);
        }
        
        // Add annual payments
        for (let i = 11; i < this.amortizationData.length; i += 12) {
            this.addAmortizationRow(fragment, this.amortizationData[i]);
        }
        
        // Add last payment if not already included
        const lastPayment = this.amortizationData[this.amortizationData.length - 1];
        if (lastPayment.paymentNumber % 12 !== 0 && this.amortizationData.length > 1) {
            this.addAmortizationRow(fragment, lastPayment);
        }
        
        amortizationBody.appendChild(fragment);
    }

    showFullAmortization() {
        const amortizationBody = document.getElementById('amortization-body');
        amortizationBody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        this.amortizationData.forEach(payment => {
            this.addAmortizationRow(fragment, payment);
        });
        
        amortizationBody.appendChild(fragment);
    }

    addAmortizationRow(fragment, payment) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.paymentNumber}</td>
            <td>${payment.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
            <td>$${payment.payment.toFixed(2)}</td>
            <td>$${payment.principal.toFixed(2)}</td>
            <td>$${payment.interest.toFixed(2)}</td>
            <td>$${payment.totalInterest.toFixed(2)}</td>
            <td>$${payment.balance.toFixed(2)}</td>
        `;
        fragment.appendChild(row);
    }

    generateChart(principal, interest, taxes, insurance, pmi) {
        const ctx = document.getElementById('mortgage-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Filter out zero values for cleaner chart
        const labels = ['Principal', 'Interest', 'Taxes', 'Insurance', 'PMI'];
        const data = [principal, interest, taxes, insurance, pmi];
        const backgroundColors = [
            '#4361ee',
            '#3a0ca3',
            '#f72585',
            '#4cc9f0',
            '#4895ef'
        ];
        
        const filteredLabels = [];
        const filteredData = [];
        const filteredColors = [];
        
        data.forEach((value, index) => {
            if (value > 0) {
                filteredLabels.push(labels[index]);
                filteredData.push(value);
                filteredColors.push(backgroundColors[index]);
            }
        });
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: filteredLabels,
                datasets: [{
                    data: filteredData,
                    backgroundColor: filteredColors,
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

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        document.getElementById('mortgage-results').style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('calculate-mortgage').addEventListener('click', () => this.calculate());
        
        document.getElementById('view-amortization').addEventListener('click', () => {
            document.getElementById('mortgage-results').style.display = 'none';
            document.getElementById('amortization-schedule').style.display = 'block';
            document.getElementById('amortization-schedule').scrollIntoView({ behavior: 'smooth' });
        });
        
        document.getElementById('back-to-results').addEventListener('click', () => {
            document.getElementById('amortization-schedule').style.display = 'none';
            document.getElementById('mortgage-results').style.display = 'block';
        });
        
        document.getElementById('show-full-schedule').addEventListener('click', () => {
            this.showFullAmortization();
            document.getElementById('show-full-schedule').classList.add('active');
            document.getElementById('show-annual-schedule').classList.remove('active');
        });
        
        document.getElementById('show-annual-schedule').addEventListener('click', () => {
            this.showAnnualAmortization();
            document.getElementById('show-annual-schedule').classList.add('active');
            document.getElementById('show-full-schedule').classList.remove('active');
        });
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.getElementById('mortgage-calculator');
    if (calculatorContainer) {
        new MortgageCalculator(calculatorContainer);
    }
});
