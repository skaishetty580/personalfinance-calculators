class TaxCalculator {
    constructor(container) {
        this.container = container;
        this.taxChart = null;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="form-row">
                    <div class="input-group">
                        <label for="tax-income">Annual Income ($)</label>
                        <input type="number" id="tax-income" placeholder="75,000" min="0" step="1000">
                    </div>
                    <div class="input-group">
                        <label for="tax-filing-status">Filing Status</label>
                        <select id="tax-filing-status">
                            <option value="single">Single</option>
                            <option value="married" selected>Married Filing Jointly</option>
                            <option value="head">Head of Household</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="input-group">
                        <label for="tax-state">State</label>
                        <select id="tax-state">
                            <option value="none">No State Income Tax</option>
                            <option value="ca">California</option>
                            <option value="ny">New York</option>
                            <option value="tx">Texas</option>
                            <option value="fl">Florida</option>
                            <option value="il">Illinois</option>
                            <option value="pa">Pennsylvania</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="tax-year">Tax Year</label>
                        <select id="tax-year">
                            <option value="2023" selected>2023</option>
                            <option value="2022">2022</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="tax-deductions">Standard Deduction ($)</label>
                    <input type="number" id="tax-deductions" placeholder="25,900" min="0" step="100" value="25900">
                </div>
                
                <div class="input-group">
                    <label for="tax-credits">Tax Credits ($)</label>
                    <input type="number" id="tax-credits" placeholder="0" min="0" step="100">
                </div>
                
                <div class="form-actions">
                    <button id="calculate-tax" class="button cta-button">
                        <i class="fas fa-calculator"></i> Calculate Tax
                    </button>
                    <button id="reset-tax" class="button back-button">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
                
                <div id="tax-results" class="results-container" style="display: none;">
                    <h3>Tax Estimation</h3>
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Federal Tax</h4>
                            <p id="federal-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>State Tax</h4>
                            <p id="state-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Effective Rate</h4>
                            <p id="effective-rate">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Take Home Pay</h4>
                            <p id="take-home">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="tax-breakdown-chart"></canvas>
                    </div>
                    
                    <div class="tax-brackets">
                        <h4>Federal Tax Breakdown</h4>
                        <div class="brackets-table-container">
                            <table class="brackets-table">
                                <thead>
                                    <tr>
                                        <th>Bracket</th>
                                        <th>Rate</th>
                                        <th>Tax</th>
                                    </tr>
                                </thead>
                                <tbody id="tax-brackets-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculate() {
        const income = parseFloat(document.getElementById('tax-income').value) || 0;
        const filingStatus = document.getElementById('tax-filing-status').value;
        const state = document.getElementById('tax-state').value;
        const deductions = parseFloat(document.getElementById('tax-deductions').value) || 0;
        const credits = parseFloat(document.getElementById('tax-credits').value) || 0;
        const year = document.getElementById('tax-year').value;

        if (!InputValidator.validatePositiveNumber(income)) {
            alert('Please enter a valid income amount');
            return;
        }

        // Calculate federal tax
        const { federalTax, brackets } = this.calculateFederalTax(income, filingStatus, year, deductions, credits);
        
        // Calculate state tax
        const stateTax = this.calculateStateTax(income, state, filingStatus, year);
        
        // Calculate totals
        const totalTax = federalTax + stateTax;
        const effectiveRate = (totalTax / income) * 100;
        const takeHomePay = income - totalTax;
        
        // Display results
        document.getElementById('federal-tax').textContent = Formatter.currency(federalTax);
        document.getElementById('state-tax').textContent = Formatter.currency(stateTax);
        document.getElementById('effective-rate').textContent = Formatter.percentage(effectiveRate);
        document.getElementById('take-home').textContent = Formatter.currency(takeHomePay);
        
        // Show tax brackets
        this.displayTaxBrackets(brackets);
        
        // Render chart
        this.renderTaxChart(income, federalTax, stateTax, takeHomePay);
        
        // Show results
        document.getElementById('tax-results').style.display = 'block';
    }

    calculateFederalTax(income, filingStatus, year, deductions, credits) {
        // Simplified tax brackets for 2023
        const brackets = {
            single: [
                { min: 0, max: 10275, rate: 0.10 },
                { min: 10275, max: 41775, rate: 0.12 },
                { min: 41775, max: 89075, rate: 0.22 },
                { min: 89075, max: 170050, rate: 0.24 },
                { min: 170050, max: 215950, rate: 0.32 },
                { min: 215950, max: 539900, rate: 0.35 },
                { min: 539900, max: Infinity, rate: 0.37 }
            ],
            married: [
                { min: 0, max: 20550, rate: 0.10 },
                { min: 20550, max: 83550, rate: 0.12 },
                { min: 83550, max: 178150, rate: 0.22 },
                { min: 178150, max: 340100, rate: 0.24 },
                { min: 340100, max: 431900, rate: 0.32 },
                { min: 431900, max: 647850, rate: 0.35 },
                { min: 647850, max: Infinity, rate: 0.37 }
            ],
            head: [
                { min: 0, max: 14650, rate: 0.10 },
                { min: 14650, max: 55900, rate: 0.12 },
                { min: 55900, max: 89050, rate: 0.22 },
                { min: 89050, max: 170050, rate: 0.24 },
                { min: 170050, max: 215950, rate: 0.32 },
                { min: 215950, max: 539900, rate: 0.35 },
                { min: 539900, max: Infinity, rate: 0.37 }
            ]
        };

        const taxableIncome = Math.max(0, income - deductions);
        let tax = 0;
        const calculatedBrackets = [];
        const applicableBrackets = brackets[filingStatus];

        for (const bracket of applicableBrackets) {
            if (taxableIncome > bracket.min) {
                const bracketAmount = Math.min(bracket.max, taxableIncome) - bracket.min;
                const bracketTax = bracketAmount * bracket.rate;
                tax += bracketTax;
                
                calculatedBrackets.push({
                    range: `${Formatter.currency(bracket.min)} - ${bracket.max === Infinity ? '∞' : Formatter.currency(bracket.max)}`,
                    rate: Formatter.percentage(bracket.rate * 100),
                    tax: Formatter.currency(bracketTax)
                });
            } else {
                break;
            }
        }

        // Apply credits
        tax = Math.max(0, tax - credits);

        return { federalTax: tax, brackets: calculatedBrackets };
    }

    calculateStateTax(income, state, filingStatus, year) {
        // Simplified state tax calculations
        const stateRates = {
            ca: 0.06,    // Approximate CA rate
            ny: 0.05,    // Approximate NY rate
            il: 0.0495,  // Flat IL rate
            pa: 0.0307,  // Flat PA rate
            tx: 0,       // No state income tax
            fl: 0        // No state income tax
        };

        if (state === 'none') return 0;
        return income * (stateRates[state] || 0);
    }

    displayTaxBrackets(brackets) {
        const tableBody = document.getElementById('tax-brackets-body');
        tableBody.innerHTML = '';
        
        brackets.forEach(bracket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bracket.range}</td>
                <td>${bracket.rate}</td>
                <td>${bracket.tax}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderTaxChart(income, federalTax, stateTax, takeHomePay) {
        // Destroy previous chart if exists
        if (this.taxChart) {
            this.taxChart.destroy();
        }
        
        const ctx = document.getElementById('tax-breakdown-chart').getContext('2d');
        this.taxChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Federal Tax', 'State Tax', 'Take Home Pay'],
                datasets: [{
                    data: [federalTax, stateTax, takeHomePay],
                    backgroundColor: [
                        '#4361ee',
                        '#f72585',
                        '#4cc9f0'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / income * 100).toFixed(1);
                                return `${context.label}: ${Formatter.currency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    resetForm() {
        document.getElementById('tax-income').value = '';
        document.getElementById('tax-filing-status').value = 'married';
        document.getElementById('tax-state').value = 'none';
        document.getElementById('tax-year').value = '2023';
        document.getElementById('tax-deductions').value = '25900';
        document.getElementById('tax-credits').value = '0';
        
        document.getElementById('tax-results').style.display = 'none';
        
        if (this.taxChart) {
            this.taxChart.destroy();
            this.taxChart = null;
        }
    }

    setupEventListeners() {
        document.getElementById('calculate-tax').addEventListener('click', () => this.calculate());
        document.getElementById('reset-tax').addEventListener('click', () => this.resetForm());
        
        // Update standard deduction based on filing status
        document.getElementById('tax-filing-status').addEventListener('change', function() {
            const filingStatus = this.value;
            const deductionField = document.getElementById('tax-deductions');
            
            // 2023 standard deductions
            const deductions = {
                single: 12950,
                married: 25900,
                head: 19400
            };
            
            deductionField.value = deductions[filingStatus] || 12950;
        });
    }
}