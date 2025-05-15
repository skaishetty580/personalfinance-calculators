class TaxCalculator {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.renderForm();
        
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
                            <option value="al">Alabama</option>
                            <option value="ak">Alaska</option>
                            <option value="az">Arizona</option>
                            <option value="ar">Arkansas</option>
                            <option value="ca">California</option>
                            <option value="co">Colorado</option>
                            <option value="ct">Connecticut</option>
                            <option value="de">Delaware</option>
                            <option value="fl">Florida</option>
                            <option value="ga">Georgia</option>
                            <option value="hi">Hawaii</option>
                            <option value="id">Idaho</option>
                            <option value="il">Illinois</option>
                            <option value="in">Indiana</option>
                            <option value="ia">Iowa</option>
                            <option value="ks">Kansas</option>
                            <option value="ky">Kentucky</option>
                            <option value="la">Louisiana</option>
                            <option value="me">Maine</option>
                            <option value="md">Maryland</option>
                            <option value="ma">Massachusetts</option>
                            <option value="mi">Michigan</option>
                            <option value="mn">Minnesota</option>
                            <option value="ms">Mississippi</option>
                            <option value="mo">Missouri</option>
                            <option value="mt">Montana</option>
                            <option value="ne">Nebraska</option>
                            <option value="nv">Nevada</option>
                            <option value="nh">New Hampshire</option>
                            <option value="nj">New Jersey</option>
                            <option value="nm">New Mexico</option>
                            <option value="ny">New York</option>
                            <option value="nc">North Carolina</option>
                            <option value="nd">North Dakota</option>
                            <option value="oh">Ohio</option>
                            <option value="ok">Oklahoma</option>
                            <option value="or">Oregon</option>
                            <option value="pa">Pennsylvania</option>
                            <option value="ri">Rhode Island</option>
                            <option value="sc">South Carolina</option>
                            <option value="sd">South Dakota</option>
                            <option value="tn">Tennessee</option>
                            <option value="tx">Texas</option>
                            <option value="ut">Utah</option>
                            <option value="vt">Vermont</option>
                            <option value="va">Virginia</option>
                            <option value="wa">Washington</option>
                            <option value="wv">West Virginia</option>
                            <option value="wi">Wisconsin</option>
                            <option value="wy">Wyoming</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="tax-year">Tax Year</label>
                        <select id="tax-year">
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                        </select>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px;">Deductions & Credits</h4>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="standard-deduction">Standard Deduction ($)</label>
                        <input type="number" id="standard-deduction" placeholder="13,850">
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
        this.setupEventListeners();
    }

    calculate() {
        // Show loading state
        const calculateBtn = this.container.querySelector('#calculate-tax');
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        try {
            // Get input values
            const income = parseFloat(this.container.querySelector('#tax-income').value) || 75000;
            const filingStatus = this.container.querySelector('#tax-filing-status').value;
            const state = this.container.querySelector('#tax-state').value;
            const taxYear = parseInt(this.container.querySelector('#tax-year').value) || 2024;
            const standardDeduction = parseFloat(this.container.querySelector('#standard-deduction').value) || this.getStandardDeduction(filingStatus, taxYear);
            const itemizedDeductions = parseFloat(this.container.querySelector('#itemized-deductions').value) || 0;
            const retirementContributions = parseFloat(this.container.querySelector('#retirement-contributions').value) || 0;
            const educationCredits = parseFloat(this.container.querySelector('#education-credits').value) || 0;
            
            // Calculate AGI and taxable income
            const agi = income - retirementContributions;
            const deduction = Math.max(standardDeduction, itemizedDeductions);
            const taxableIncome = Math.max(0, agi - deduction);
            
            // Calculate federal tax
            let federalTax = 0;
            const brackets = this.getFederalTaxBrackets(filingStatus, taxYear);
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
            
            // Calculate FICA tax (2024 updates)
            const socialSecurityWageBase = taxYear >= 2024 ? 168600 : 160200;
            const socialSecurityTax = Math.min(income, socialSecurityWageBase) * 0.062;
            const medicareTax = income * 0.0145;
            // Additional Medicare tax for high earners
            let additionalMedicareTax = 0;
            if (filingStatus === 'single' && income > 200000) {
                additionalMedicareTax = (income - 200000) * 0.009;
            } else if (filingStatus !== 'single' && income > 250000) {
                additionalMedicareTax = (income - 250000) * 0.009;
            }
            const ficaTax = socialSecurityTax + medicareTax + additionalMedicareTax;
            
            // Calculate state tax
            const stateTax = this.calculateStateTax(state, taxableIncome, income, filingStatus, taxYear);
            
            // Calculate totals
            const totalTax = federalTax + stateTax + ficaTax;
            const effectiveRate = (totalTax / income) * 100;
            const afterTaxIncome = income - totalTax;
            
            // Display results
            this.container.querySelector('#gross-income').textContent = `$${income.toLocaleString('en-US')}`;
            this.container.querySelector('#agi').textContent = `$${agi.toLocaleString('en-US')}`;
            this.container.querySelector('#taxable-income').textContent = `$${taxableIncome.toLocaleString('en-US')}`;
            this.container.querySelector('#federal-tax').textContent = `$${federalTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
            this.container.querySelector('#state-tax').textContent = stateTax ? `$${stateTax.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '$0.00';
            this.container.querySelector('#fica-tax').textContent = `$${ficaTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
            this.container.querySelector('#total-tax').textContent = `$${totalTax.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
            this.container.querySelector('#effective-rate').textContent = `${effectiveRate.toFixed(1)}%`;
            this.container.querySelector('#after-tax-income').textContent = `$${afterTaxIncome.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
            
            // Generate tax brackets table
            this.generateBracketsTable(bracketDetails);
            
            // Generate chart
            this.generateChart(income, federalTax, stateTax, ficaTax);
            
            // Show results
            this.container.querySelector('#tax-results').style.display = 'block';
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred during calculation');
        } finally {
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Tax Liability';
        }
    }

    getFederalTaxBrackets(filingStatus, year) {
        if (year === 2024) {
            if (filingStatus === 'single') {
                return [
                    { max: 11600, rate: 10 },
                    { max: 47150, rate: 12 },
                    { max: 100525, rate: 22 },
                    { max: 191950, rate: 24 },
                    { max: 243725, rate: 32 },
                    { max: 609350, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else if (filingStatus === 'married') {
                return [
                    { max: 23200, rate: 10 },
                    { max: 94300, rate: 12 },
                    { max: 201050, rate: 22 },
                    { max: 383900, rate: 24 },
                    { max: 487450, rate: 32 },
                    { max: 731200, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else { // head of household
                return [
                    { max: 16550, rate: 10 },
                    { max: 63100, rate: 12 },
                    { max: 100500, rate: 22 },
                    { max: 191950, rate: 24 },
                    { max: 243700, rate: 32 },
                    { max: 609350, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            }
        } else if (year === 2023) {
            if (filingStatus === 'single') {
                return [
                    { max: 11000, rate: 10 },
                    { max: 44725, rate: 12 },
                    { max: 95375, rate: 22 },
                    { max: 182100, rate: 24 },
                    { max: 231250, rate: 32 },
                    { max: 578125, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else if (filingStatus === 'married') {
                return [
                    { max: 22000, rate: 10 },
                    { max: 89450, rate: 12 },
                    { max: 190750, rate: 22 },
                    { max: 364200, rate: 24 },
                    { max: 462500, rate: 32 },
                    { max: 693750, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            } else { // head of household
                return [
                    { max: 15700, rate: 10 },
                    { max: 59850, rate: 12 },
                    { max: 95350, rate: 22 },
                    { max: 182100, rate: 24 },
                    { max: 231250, rate: 32 },
                    { max: 578100, rate: 35 },
                    { max: Infinity, rate: 37 }
                ];
            }
        } else { // 2022
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
        }
    }

    getStandardDeduction(filingStatus, year) {
        if (year === 2024) {
            if (filingStatus === 'single') return 14600;
            if (filingStatus === 'married') return 29200;
            if (filingStatus === 'head') return 21900;
        } else if (year === 2023) {
            if (filingStatus === 'single') return 13850;
            if (filingStatus === 'married') return 27700;
            if (filingStatus === 'head') return 20800;
        } else { // 2022
            if (filingStatus === 'single') return 12950;
            if (filingStatus === 'married') return 25900;
            if (filingStatus === 'head') return 19400;
        }
        return 0;
    }

    calculateStateTax(state, taxableIncome, grossIncome, filingStatus, year) {
        // States with no income tax
        const noTaxStates = ['ak', 'fl', 'nv', 'sd', 'tx', 'wa', 'wy', 'tn', 'nh'];
        if (noTaxStates.includes(state)) return 0;
        
        // Flat rate states
        const flatRateStates = {
            'co': 0.044,    // Colorado
            'il': 0.0495,    // Illinois
            'in': 0.0315,    // Indiana
            'mi': 0.0425,    // Michigan
            'nc': 0.0475,    // North Carolina
            'pa': 0.0307,    // Pennsylvania
            'ut': 0.0485     // Utah
        };
        
        if (flatRateStates[state]) {
            return taxableIncome * flatRateStates[state];
        }
        
        // Progressive tax states (simplified calculations)
        switch(state) {
            case 'ca': // California
                if (filingStatus === 'single') {
                    if (taxableIncome <= 10099) return taxableIncome * 0.01;
                    if (taxableIncome <= 23942) return 101 + (taxableIncome - 10099) * 0.02;
                    if (taxableIncome <= 37788) return 377.85 + (taxableIncome - 23942) * 0.04;
                    if (taxableIncome <= 52455) return 931.69 + (taxableIncome - 37788) * 0.06;
                    if (taxableIncome <= 66295) return 1811.71 + (taxableIncome - 52455) * 0.08;
                    if (taxableIncome <= 338639) return 2919.19 + (taxableIncome - 66295) * 0.093;
                    if (taxableIncome <= 406364) return 28083.28 + (taxableIncome - 338639) * 0.103;
                    if (taxableIncome <= 677275) return 35063.64 + (taxableIncome - 406364) * 0.113;
                    return 65689.46 + (taxableIncome - 677275) * 0.123;
                } else if (filingStatus === 'married') {
                    // Similar brackets for married (simplified for demo)
                    return taxableIncome * 0.06;
                } else {
                    // Head of household
                    return taxableIncome * 0.05;
                }
                
            case 'ny': // New York
                if (filingStatus === 'single') {
                    if (taxableIncome <= 8500) return taxableIncome * 0.04;
                    if (taxableIncome <= 11700) return 340 + (taxableIncome - 8500) * 0.045;
                    if (taxableIncome <= 13900) return 484 + (taxableIncome - 11700) * 0.0525;
                    if (taxableIncome <= 21400) return 600 + (taxableIncome - 13900) * 0.059;
                    if (taxableIncome <= 80650) return 1043 + (taxableIncome - 21400) * 0.0609;
                    if (taxableIncome <= 215400) return 4652 + (taxableIncome - 80650) * 0.0641;
                    if (taxableIncome <= 1077550) return 13266 + (taxableIncome - 215400) * 0.0685;
                    if (taxableIncome <= 5000000) return 72337 + (taxableIncome - 1077550) * 0.0965;
                    if (taxableIncome <= 25000000) return 450683 + (taxableIncome - 5000000) * 0.103;
                    return 2510683 + (taxableIncome - 25000000) * 0.109;
                } else {
                    // Simplified for other statuses
                    return taxableIncome * 0.05;
                }
                
            // Add more states as needed...
                
            default:
                // Default to a simplified calculation for other states
                return taxableIncome * 0.05;
        }
    }

    generateBracketsTable(brackets) {
        const bracketsBody = this.container.querySelector('#brackets-body');
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
        const ctx = this.container.querySelector('#tax-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Federal Tax', 'State Tax', 'FICA Tax', 'After-Tax Income'],
                datasets: [{
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
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / income) * 100);
                                return `${label}: $${value.toLocaleString('en-US')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        this.container.querySelector('#calculate-tax').addEventListener('click', () => this.calculate());
        
        // Update standard deduction when filing status or year changes
        this.container.querySelector('#tax-filing-status').addEventListener('change', () => {
            const filingStatus = this.container.querySelector('#tax-filing-status').value;
            const year = parseInt(this.container.querySelector('#tax-year').value) || 2024;
            this.container.querySelector('#standard-deduction').value = this.getStandardDeduction(filingStatus, year);
        });
        
        this.container.querySelector('#tax-year').addEventListener('change', () => {
            const filingStatus = this.container.querySelector('#tax-filing-status').value;
            const year = parseInt(this.container.querySelector('#tax-year').value) || 2024;
            this.container.querySelector('#standard-deduction').value = this.getStandardDeduction(filingStatus, year);
        });
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaxCalculator;
} else {
    window.TaxCalculator = TaxCalculator;
}
