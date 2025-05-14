class InvestmentCalculator {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.yearlyData = [];
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="input-row">
                    <div class="input-group">
                        <label for="initial-investment">Initial Investment ($)</label>
                        <input type="number" id="initial-investment" placeholder="10,000" min="0" value="10000">
                    </div>
                    <div class="input-group">
                        <label for="monthly-contribution">Monthly Contribution ($)</label>
                        <input type="number" id="monthly-contribution" placeholder="500" min="0" value="500">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="investment-years">Investment Period (years)</label>
                        <input type="number" id="investment-years" placeholder="20" min="1" max="100" value="20">
                    </div>
                    <div class="input-group">
                        <label for="expected-return">Expected Return (%)</label>
                        <input type="number" id="expected-return" placeholder="7" step="0.01" min="0" max="50" value="7">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="inflation-rate">Inflation Rate (%)</label>
                        <input type="number" id="inflation-rate" placeholder="2.5" step="0.01" min="0" max="20" value="2.5">
                    </div>
                    <div class="input-group">
                        <label for="tax-rate">Tax Rate (%)</label>
                        <input type="number" id="tax-rate" placeholder="20" step="0.01" min="0" max="100" value="20">
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="compound-frequency">Compound Frequency</label>
                    <select id="compound-frequency">
                        <option value="1">Annually</option>
                        <option value="2">Semi-Annually</option>
                        <option value="4">Quarterly</option>
                        <option value="12" selected>Monthly</option>
                        <option value="365">Daily</option>
                    </select>
                </div>
                
                <button id="calculate-investment" class="button cta-button">
                    <i class="fas fa-chart-line"></i> Calculate Investment Growth
                </button>
                
                <div id="error-message" class="error-message" style="display: none;"></div>
                
                <div id="investment-results" class="results-container" style="display: none;">
                    <div class="results-header">
                        <h3>Investment Projection</h3>
                        <button id="view-performance" class="button card-button">
                            <i class="fas fa-table"></i> View Performance Table
                        </button>
                    </div>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Initial Investment</h4>
                            <p id="initial-investment-result">$10,000.00</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Contributions</h4>
                            <p id="total-contributions">$130,000.00</p>
                        </div>
                        <div class="result-item">
                            <h4>Interest Earned</h4>
                            <p id="interest-earned">$147,913.93</p>
                        </div>
                        <div class="result-item">
                            <h4>Final Balance</h4>
                            <p id="final-balance">$287,913.93</p>
                        </div>
                        <div class="result-item">
                            <h4>Inflation Adjusted</h4>
                            <p id="inflation-adjusted">$175,413.93</p>
                        </div>
                        <div class="result-item">
                            <h4>After Taxes</h4>
                            <p id="after-taxes">$258,331.14</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="investment-chart"></canvas>
                    </div>
                    
                    <div id="performance-table" class="performance-table" style="display: none;">
                        <h4>Year-by-Year Growth</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Starting Balance</th>
                                        <th>Contributions</th>
                                        <th>Interest</th>
                                        <th>Ending Balance</th>
                                        <th>Inflation Adjusted</th>
                                        <th>After Taxes</th>
                                    </tr>
                                </thead>
                                <tbody id="performance-body">
                                </tbody>
                            </table>
                        </div>
                        <button id="back-to-results" class="button back-button">
                            <i class="fas fa-arrow-left"></i> Back to Results
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    validateInputs() {
        const initialInvestment = this.parseInputValue('initial-investment');
        const monthlyContribution = this.parseInputValue('monthly-contribution');
        const years = this.parseInputValue('investment-years');
        const expectedReturn = this.parseInputValue('expected-return');
        const inflationRate = this.parseInputValue('inflation-rate');
        const taxRate = this.parseInputValue('tax-rate');
        
        if (initialInvestment < 0) {
            throw new Error('Initial investment cannot be negative');
        }
        
        if (monthlyContribution < 0) {
            throw new Error('Monthly contribution cannot be negative');
        }
        
        if (years < 1 || years > 100) {
            throw new Error('Investment period must be between 1 and 100 years');
        }
        
        if (expectedReturn < 0 || expectedReturn > 50) {
            throw new Error('Expected return must be between 0% and 50%');
        }
        
        if (inflationRate < 0 || inflationRate > 20) {
            throw new Error('Inflation rate must be between 0% and 20%');
        }
        
        if (taxRate < 0 || taxRate > 100) {
            throw new Error('Tax rate must be between 0% and 100%');
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
            const initialInvestment = this.parseInputValue('initial-investment');
            const monthlyContribution = this.parseInputValue('monthly-contribution');
            const years = this.parseInputValue('investment-years');
            const expectedReturn = this.parseInputValue('expected-return');
            const inflationRate = this.parseInputValue('inflation-rate');
            const taxRate = this.parseInputValue('tax-rate');
            const compoundFrequency = parseInt(document.getElementById('compound-frequency').value);
            
            // Calculate periodic values
            const periodicRate = expectedReturn / 100 / compoundFrequency;
            const totalPeriods = years * compoundFrequency;
            const periodicContribution = monthlyContribution * (12 / compoundFrequency);
            
            // Calculate future value with contributions
            let futureValue = initialInvestment * Math.pow(1 + periodicRate, totalPeriods);
            if (periodicContribution > 0) {
                futureValue += periodicContribution * (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
            }
            
            // Calculate yearly breakdown
            this.yearlyData = [];
            let balance = initialInvestment;
            let totalContributions = initialInvestment;
            let totalInterest = 0;
            
            for (let year = 1; year <= years; year++) {
                const startingBalance = balance;
                let yearlyInterest = 0;
                let yearlyContributions = 0;
                
                // Calculate for each compounding period in the year
                for (let period = 1; period <= compoundFrequency; period++) {
                    const contribution = periodicContribution;
                    yearlyContributions += contribution;
                    totalContributions += contribution;
                    
                    const periodInterest = balance * periodicRate;
                    yearlyInterest += periodInterest;
                    
                    balance += contribution + periodInterest;
                }
                
                totalInterest += yearlyInterest;
                
                // Calculate inflation-adjusted and after-tax values
                const inflationAdjusted = balance / Math.pow(1 + (inflationRate / 100), year);
                const afterTaxes = startingBalance + yearlyContributions + (yearlyInterest * (1 - taxRate / 100));
                
                this.yearlyData.push({
                    year,
                    startingBalance,
                    contributions: yearlyContributions,
                    interest: yearlyInterest,
                    endingBalance: balance,
                    inflationAdjusted,
                    afterTaxes
                });
            }
            
            // Verify total interest matches the difference between future value and total contributions
            totalInterest = futureValue - totalContributions;
            
            // Calculate summary values
            const inflationAdjusted = futureValue / Math.pow(1 + (inflationRate / 100), years);
            const afterTaxes = initialInvestment + 
                             (totalContributions - initialInvestment) + 
                             (totalInterest * (1 - taxRate / 100));
            
            // Display results
            this.displayResults({
                initialInvestment,
                totalContributions,
                totalInterest,
                futureValue,
                inflationAdjusted,
                afterTaxes
            });
            
            // Generate performance table
            this.generatePerformanceTable();
            
            // Generate chart
            this.generateChart(initialInvestment, totalContributions - initialInvestment, totalInterest);
            
            // Show results
            document.getElementById('investment-results').style.display = 'block';
            document.getElementById('error-message').style.display = 'none';
            
        } catch (error) {
            this.showError(error.message);
            console.error(error);
        }
    }

    displayResults(results) {
        const formatCurrency = (value) => `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
        
        document.getElementById('initial-investment-result').textContent = formatCurrency(results.initialInvestment);
        document.getElementById('total-contributions').textContent = formatCurrency(results.totalContributions);
        document.getElementById('interest-earned').textContent = formatCurrency(results.totalInterest);
        document.getElementById('final-balance').textContent = formatCurrency(results.futureValue);
        document.getElementById('inflation-adjusted').textContent = formatCurrency(results.inflationAdjusted);
        document.getElementById('after-taxes').textContent = formatCurrency(results.afterTaxes);
    }

    generatePerformanceTable() {
        const performanceBody = document.getElementById('performance-body');
        performanceBody.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        this.yearlyData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.year}</td>
                <td>${this.formatCurrency(item.startingBalance)}</td>
                <td>${this.formatCurrency(item.contributions)}</td>
                <td>${this.formatCurrency(item.interest)}</td>
                <td>${this.formatCurrency(item.endingBalance)}</td>
                <td>${this.formatCurrency(item.inflationAdjusted)}</td>
                <td>${this.formatCurrency(item.afterTaxes)}</td>
            `;
            fragment.appendChild(row);
        });
        
        performanceBody.appendChild(fragment);
    }

    formatCurrency(value) {
        return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    generateChart(initial, contributions, interest) {
        const ctx = document.getElementById('investment-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Initial Investment', 'Contributions', 'Interest Earned'],
                datasets: [{
                    data: [initial, contributions, interest],
                    backgroundColor: [
                        '#4361ee',
                        '#3a0ca3',
                        '#4cc9f0'
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
                                return `${label}: $${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')} (${percentage}%)`;
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
        document.getElementById('investment-results').style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('calculate-investment').addEventListener('click', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        document.getElementById('view-performance').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('investment-results').style.display = 'none';
            document.getElementById('performance-table').style.display = 'block';
            document.getElementById('performance-table').scrollIntoView({ behavior: 'smooth' });
        });
        
        document.getElementById('back-to-results').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('performance-table').style.display = 'none';
            document.getElementById('investment-results').style.display = 'block';
        });
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.getElementById('investment-calculator');
    if (calculatorContainer) {
        new InvestmentCalculator(calculatorContainer);
    }
});
