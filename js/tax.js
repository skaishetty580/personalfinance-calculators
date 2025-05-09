class TaxCalculator {
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
                        <label for="tax-income">Annual Income ($)</label>
                        <input type="number" id="tax-income" placeholder="75,000">
                    </div>
                    <div class="input-group">
                        <label for="tax-filing-status">Filing Status</label>
                        <select id="tax-filing-status">
                            <option value="single">Single</option>
                            <option value="married">Married Filing Jointly</option>
                            <option value="head">Head of Household</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-row">
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
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                        </select>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px;">Deductions & Credits</h4>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="standard-deduction">Standard Deduction ($)</label>
                        <input type="number" id="standard-deduction" placeholder="12,950">
                    </div>
                    <div class="input-group">
                        <label for="itemized-deductions">Itemized Deductions ($)</label>
                        <input type="number" id="itemized-deductions" placeholder="0">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="retirement-contributions">Retirement Contributions ($)</label>
                        <input type="number" id="retirement-contributions" placeholder="0">
                    </div>
                    <div class="input-group">
                        <label for="education-credits">Education Credits ($)</label>
                        <input type="number" id="education-credits" placeholder="0">
                    </div>
                </div>
                
                <button id="calculate-tax" class="button cta-button">
                    <i class="fas fa-calculator"></i> Calculate Tax Liability
                </button>
                
                <div id="tax-results" class="results-container" style="display: none;">
                    <h3>Tax Estimation</h3>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Gross Income</h4>
                            <p id="gross-income">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Adjusted Gross Income</h4>
                            <p id="agi">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Taxable Income</h4>
                            <p id="taxable-income">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Federal Tax</h4>
                            <p id="federal-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>State Tax</h4>
                            <p id="state-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>FICA Tax</h4>
                            <p id="fica-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Tax</h4>
                            <p id="total-tax">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Effective Tax Rate</h4>
                            <p id="effective-rate">-</p>
                        </div>
                        <div class="result-item">
                            <h4>After-Tax Income</h4>
                            <p id="after-tax-income">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="tax-chart"></canvas>
                    </div>
                    
                    <div class="tax-brackets">
                        <h4>Federal Tax Breakdown</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bracket</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody id="brackets-body">
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
        const income = parseFloat(document.getElementById('tax-income').value) || 75000;
        const filingStatus = document.getElementById('tax-filing-status').value;
        const state = document.getElementById('tax-state').value;
        const taxYear = parseInt(document.getElementById('tax-year').value) || 2023;
        const standardDeduction = parseFloat(document.getElementById('standard-deduction').value) || 12950;
        const itemizedDeductions = parseFloat(document.getElementById('itemized-deductions').value) || 0;
        const retirementContributions = parseFloat(document.getElementById('retirement-contributions').value) || 0;
        const educationCredits = parseFloat(document.getElementById('education-credits').value) || 0;
        
        // Calculate AGI and taxable income
        const agi = income - retirementContributions;
        const deduction = Math.max(standardDeduction, itemizedDeductions);
        const taxableIncome = Math.max(0, agi - deduction);
        
        // Calculate federal tax (using 2023 brackets)
        let federalTax = 0;
        const brackets = this.getTaxBrackets(filingStatus, taxYear);
        let remainingIncome = taxableIncome;
        const bracketDetails = [];
        
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const bracketMax = bracket.max || Infinity;
            const bracketRange = Math.min(remainingIncome, bracketMax - (brackets[i-1]?.max || 0));
            
            if (bracketRange > 0) {
                const bracketTax = bracketRange * (bracket.rate / 100);
                federalTax += bracketTax;
                bracketDetails.push({
                    range: `$${(brackets[i-1]?.max || 0).toLocaleString('en-US')} - $${bracketMax === Infinity ? '∞' : bracketMax.toLocaleString('en-US')}`,
                    rate: `${bracket.rate}%`,
                    amount: `$${bracketTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`
                });
                remainingIncome -= bracketRange;
            }
        }
        
        // Apply education credits
        federalTax = Math.max(0, federalTax - educationCredits);
        
        // Calculate FICA tax
        const socialSecurityTax = Math.min(income, 160200) * 0.062;
        const medicareTax = income * 0.0145;
        const ficaTax = socialSecurityTax + medicareTax;
        
        // Calculate state tax (simplified)
        let stateTax = 0;
        if (state === 'ca') {
            stateTax = taxableIncome * 0.06; // Approximate CA rate
        } else if (state === 'ny') {
            stateTax = taxableIncome * 0.05; // Approximate NY rate
        } else if (state === 'il' || state === 'pa') {
            stateTax = income * 0.03; // Flat rate states
        }
        // TX, FL have no state income tax
        
        // Calculate totals
        const totalTax = federalTax + stateTax + ficaTax;
        const effectiveRate = (totalTax / income) * 100;
        const afterTaxIncome = income - totalTax;
        
        // Display results
        document.getElementById('gross-income').textContent = `$${income.toLocaleString('en-US')}`;
        document.getElementById('agi').textContent = `$${agi.toLocaleString('en-US')}`;
        document.getElementById('taxable-income').textContent = `$${taxableIncome.toLocaleString('en-US')}`;
        document.getElementById('federal-tax').textContent = `$${federalTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('state-tax').textContent = stateTax ? `$${stateTax.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '$0.00';
        document.getElementById('fica-tax').textContent = `$${ficaTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('total-tax').textContent = `$${totalTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('effective-rate').textContent = `${effectiveRate.toFixed(1)}%`;
        document.getElementById('after-tax-income').textContent = `$${afterTaxIncome.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        
        // Generate tax brackets table
        this.generateBracketsTable(bracketDetails);
        
        // Generate chart
        this.generateChart(income, federalTax, stateTax, ficaTax);
        
        // Show results
        document.getElementById('tax-results').style.display = 'block';
    }

    getTaxBrackets(filingStatus, year) {
        // 2023 Federal Tax Brackets
        if (year === 2023) {
            if (filingStatus === 'single') {
                return [
                    { max: 10275, rate: 10 },
                    { max: 41775, rate: 12 },
                    { max: 89075, rate: 22 },
                    { max: 170050, rate: 24 },
                    { max: 215950, rate: 32 },
                    { max: 539900, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else if (filingStatus === 'married') {
                return [
                    { max: 20550, rate: 10 },
                    { max: 83550, rate: 12 },
                    { max: 178150, rate: 22 },
                    { max: 340100, rate: 24 },
                    { max: 431900, rate: 32 },
                    { max: 647850, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else { // head of household
                return [
                    { max: 14650, rate: 10 },
                    { max: 55900, rate: 12 },
                    { max: 89050, rate: 22 },
                    { max: 170050, rate: 24 },
                    { max: 215950, rate: 32 },
                    { max: 539900, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            }
        } else { // 2022 brackets (similar structure)
            // ... would include 2022 bracket data
            return []; // simplified for demo
        }
    }

    generateBracketsTable(brackets) {
        const bracketsBody = document.getElementById('brackets-body');
        bracketsBody.innerHTML = '';
        
        brackets.forEach(bracket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bracket.range}</td>
                <td>${bracket.rate}</td>
                <td>${bracket.amount}</td>
            `;
            bracketsBody.appendChild(row);
        });
    }

    generateChart(income, federal, state, fica) {
        const ctx = document.getElementById('tax-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Federal Tax', 'State Tax', 'FICA Tax', 'After-Tax Income'],
                datasets: [{
                    label: 'Amount ($)',
                    data: [federal, state, fica, income - federal - state - fica],
                    backgroundColor: [
                        '#4361ee',
                        '#3a0ca3',
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
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / income) * 100);
                                return `${label}: $${value.toLocaleString('en-US')} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('en-US');
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('calculate-tax').addEventListener('click', () => this.calculate());
        
        // Update standard deduction based on filing status and year
        document.getElementById('tax-filing-status').addEventListener('change', () => this.updateDeduction());
        document.getElementById('tax-year').addEventListener('change', () => this.updateDeduction());
    }
    
    updateDeduction() {
        const filingStatus = document.getElementById('tax-filing-status').value;
        const year = parseInt(document.getElementById('tax-year').value) || 2023;
        
        let deduction = 12950; // Default single filer 2023
        
        if (year === 2023) {
            if (filingStatus === 'married') deduction = 25900;
            else if (filingStatus === 'head') deduction = 19400;
        } else { // 2022
            if (filingStatus === 'single') deduction = 12550;
            else if (filingStatus === 'married') deduction = 25100;
            else if (filingStatus === 'head') deduction = 18800;
        }
        
        document.getElementById('standard-deduction').value = deduction;
    }
}
