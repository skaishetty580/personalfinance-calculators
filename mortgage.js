class MortgageCalculator {
    constructor(container) {
        this.container = container;
        this.amortizationChart = null;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="form-row">
                    <div class="input-group">
                        <label for="mortgage-amount">Home Value ($)</label>
                        <input type="number" id="mortgage-amount" placeholder="300,000" min="10000" step="1000">
                    </div>
                    <div class="input-group">
                        <label for="down-payment">Down Payment ($)</label>
                        <input type="number" id="down-payment" placeholder="60,000" min="0" step="1000">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="input-group">
                        <label for="interest-rate">Interest Rate (%)</label>
                        <input type="number" id="interest-rate" placeholder="3.5" min="0.1" max="20" step="0.01">
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
                
                <div class="input-group">
                    <label for="property-tax">Annual Property Tax ($)</label>
                    <input type="number" id="property-tax" placeholder="3,000" min="0" step="100">
                </div>
                
                <div class="input-group">
                    <label for="home-insurance">Annual Home Insurance ($)</label>
                    <input type="number" id="home-insurance" placeholder="1,200" min="0" step="100">
                </div>
                
                <div class="input-group">
                    <label for="pmi">PMI Rate (%)</label>
                    <input type="number" id="pmi" placeholder="0.5" min="0" max="2" step="0.01" value="0">
                </div>
                
                <div class="form-actions">
                    <button id="calculate-mortgage" class="button cta-button">
                        <i class="fas fa-calculator"></i> Calculate Mortgage
                    </button>
                    <button id="reset-mortgage" class="button back-button">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
                
                <div id="mortgage-results" class="results-container" style="display: none;">
                    <h3>Mortgage Results</h3>
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Loan Amount</h4>
                            <p id="loan-amount">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Monthly Payment</h4>
                            <p id="monthly-payment">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Interest</h4>
                            <p id="total-interest">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Cost</h4>
                            <p id="total-cost">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="amortization-chart"></canvas>
                    </div>
                    
                    <div class="amortization-schedule">
                        <h4>Amortization Schedule (First 12 Months)</h4>
                        <div class="schedule-table-container">
                            <table class="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Payment</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody id="amortization-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculate() {
        // Get input values
        const homeValue = parseFloat(document.getElementById('mortgage-amount').value) || 300000;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 60000;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) || 3.5;
        const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
        const propertyTax = parseFloat(document.getElementById('property-tax').value) || 3000;
        const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 1200;
        const pmiRate = parseFloat(document.getElementById('pmi').value) || 0;

        // Validate inputs
        if (!InputValidator.validatePositiveNumber(homeValue) {
            alert('Please enter a valid home value');
            return;
        }

        if (downPayment > homeValue) {
            alert('Down payment cannot exceed home value');
            return;
        }

        // Calculate loan details
        const loanAmount = homeValue - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const payments = loanTerm * 12;
        
        // Calculate PMI if down payment is less than 20%
        let pmi = 0;
        if (downPayment < homeValue * 0.2) {
            pmi = (loanAmount * (pmiRate / 100)) / 12;
        }

        // Calculate monthly payment
        const monthlyPayment = loanAmount * monthlyRate * 
            Math.pow(1 + monthlyRate, payments) / 
            (Math.pow(1 + monthlyRate, payments) - 1);

        // Calculate total monthly payment with taxes and insurance
        const totalMonthlyPayment = monthlyPayment + 
                                  (propertyTax / 12) + 
                                  (homeInsurance / 12) + 
                                  pmi;

        // Calculate total interest
        const totalInterest = (monthlyPayment * payments) - loanAmount;
        const totalCost = loanAmount + totalInterest + propertyTax * loanTerm + homeInsurance * loanTerm + pmi * payments;

        // Display results
        document.getElementById('loan-amount').textContent = Formatter.currency(loanAmount);
        document.getElementById('monthly-payment').textContent = Formatter.currency(totalMonthlyPayment);
        document.getElementById('total-interest').textContent = Formatter.currency(totalInterest);
        document.getElementById('total-cost').textContent = Formatter.currency(totalCost);

        // Generate amortization schedule
        this.generateAmortizationSchedule(loanAmount, monthlyRate, payments, monthlyPayment);

        // Show results
        document.getElementById('mortgage-results').style.display = 'block';
    }

    generateAmortizationSchedule(principal, monthlyRate, payments, monthlyPayment) {
        let balance = principal;
        let totalInterest = 0;
        const schedule = [];
        
        for (let month = 1; month <= 12; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            totalInterest += interestPayment;
            balance -= principalPayment;
            
            schedule.push({
                month,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                balance: balance > 0 ? balance : 0
            });
        }
        
        // Render schedule table
        const tableBody = document.getElementById('amortization-body');
        tableBody.innerHTML = '';
        
        schedule.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.month}</td>
                <td>${Formatter.currency(item.payment)}</td>
                <td>${Formatter.currency(item.principal)}</td>
                <td>${Formatter.currency(item.interest)}</td>
                <td>${Formatter.currency(item.balance)}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // Render chart
        this.renderAmortizationChart(schedule);
    }

    renderAmortizationChart(schedule) {
        const labels = schedule.map(item => `Month ${item.month}`);
        const principalData = schedule.map(item => item.principal);
        const interestData = schedule.map(item => item.interest);
        
        // Destroy previous chart if exists
        if (this.amortizationChart) {
            this.amortizationChart.destroy();
        }
        
        const ctx = document.getElementById('amortization-chart').getContext('2d');
        this.amortizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Principal',
                        data: principalData,
                        backgroundColor: '#4361ee',
                        borderColor: '#4361ee',
                        borderWidth: 1
                    },
                    {
                        label: 'Interest',
                        data: interestData,
                        backgroundColor: '#f72585',
                        borderColor: '#f72585',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Principal vs Interest Payments'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Formatter.currency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Formatter.currency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    resetForm() {
        document.getElementById('mortgage-amount').value = '';
        document.getElementById('down-payment').value = '';
        document.getElementById('interest-rate').value = '3.5';
        document.getElementById('loan-term').value = '30';
        document.getElementById('property-tax').value = '3000';
        document.getElementById('home-insurance').value = '1200';
        document.getElementById('pmi').value = '0.5';
        
        document.getElementById('mortgage-results').style.display = 'none';
        
        if (this.amortizationChart) {
            this.amortizationChart.destroy();
            this.amortizationChart = null;
        }
    }

    setupEventListeners() {
        document.getElementById('calculate-mortgage').addEventListener('click', () => this.calculate());
        document.getElementById('reset-mortgage').addEventListener('click', () => this.resetForm());
        
        // Auto-calculate when home value or down payment changes
        document.getElementById('mortgage-amount').addEventListener('change', () => {
            const homeValue = parseFloat(document.getElementById('mortgage-amount').value) || 0;
            const defaultDown = Math.round(homeValue * 0.2);
            if (!document.getElementById('down-payment').value) {
                document.getElementById('down-payment').value = defaultDown;
            }
            
            // Update PMI field visibility
            const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
            const pmiField = document.getElementById('pmi');
            if (downPayment >= homeValue * 0.2) {
                pmiField.value = '0';
                pmiField.disabled = true;
            } else {
                pmiField.disabled = false;
                if (pmiField.value === '0') pmiField.value = '0.5';
            }
        });
        
        document.getElementById('down-payment').addEventListener('change', () => {
            const homeValue = parseFloat(document.getElementById('mortgage-amount').value) || 0;
            const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
            const pmiField = document.getElementById('pmi');
            
            if (downPayment >= homeValue * 0.2) {
                pmiField.value = '0';
                pmiField.disabled = true;
            } else {
                pmiField.disabled = false;
                if (pmiField.value === '0') pmiField.value = '0.5';
            }
        });
    }
}