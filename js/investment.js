class InvestmentCalculator {
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
                        <label for="initial-investment">Initial Investment ($)</label>
                        <input type="number" id="initial-investment" placeholder="10,000">
                    </div>
                    <div class="input-group">
                        <label for="monthly-contribution">Monthly Contribution ($)</label>
                        <input type="number" id="monthly-contribution" placeholder="500">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="investment-years">Investment Period (years)</label>
                        <input type="number" id="investment-years" placeholder="20">
                    </div>
                    <div class="input-group">
                        <label for="expected-return">Expected Return (%)</label>
                        <input type="number" id="expected-return" placeholder="7" step="0.1">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="inflation-rate">Inflation Rate (%)</label>
                        <input type="number" id="inflation-rate" placeholder="2.5" step="0.1">
                    </div>
                    <div class="input-group">
                        <label for="tax-rate">Tax Rate (%)</label>
                        <input type="number" id="tax-rate" placeholder="20" step="0.1">
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
                
                <div id="investment-results" class="results-container" style="display: none;">
                    <h3>Investment Projection</h3>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Initial Investment</h4>
                            <p id="initial-investment-result">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Contributions</h4>
                            <p id="total-contributions">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Interest Earned</h4>
                            <p id="interest-earned">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Final Balance</h4>
                            <p id="final-balance">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Inflation Adjusted</h4>
                            <p id="inflation-adjusted">-</p>
                        </div>
                        <div class="result-item">
                            <h4>After Taxes</h4>
                            <p id="after-taxes">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="investment-chart"></canvas>
                    </div>
                    
                    <div class="performance-table">
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
                                    </tr>
                                </thead>
                                <tbody id="performance-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculate() {
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 10000;
        const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 500;
        const years = parseFloat(document.getElementById('investment-years').value) || 20;
        const expectedReturn = parseFloat(document.getElementById('expected-return').value) || 7;
        const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 20;
        const compoundFrequency = parseInt(document.getElementById('compound-frequency').value) || 12;

        const periodsPerYear = compoundFrequency;
        const totalPeriods = years * periodsPerYear;
        const periodicRate = expectedReturn / 100 / periodsPerYear;

        let balance = initialInvestment;
        const yearlyData = [];

        for (let year = 1; year <= years; year++) {
            const startingBalance = balance;
            let yearContributions = 0;
            let yearInterest = 0;

            for (let p = 1; p <= periodsPerYear; p++) {
                const contribution = monthlyContribution * (12 / periodsPerYear); // Adjust contribution based on frequency
                balance += contribution;
                yearContributions += contribution;
                const interest = balance * periodicRate;
                balance += interest;
                yearInterest += interest;
            }

            yearlyData.push({
                year,
                startingBalance,
                contributions: yearContributions,
                interest: yearInterest,
                endingBalance: balance
            });
        }

        const totalContributions = (monthlyContribution * 12 * years) + initialInvestment;
        const interestEarned = balance - totalContributions;
        const inflationAdjusted = balance / Math.pow(1 + (inflationRate / 100), years);
        const afterTaxes = balance - (interestEarned * (taxRate / 100));

        document.getElementById('initial-investment-result').textContent = `$${initialInvestment.toLocaleString('en-US')}`;
        document.getElementById('total-contributions').textContent = `$${(totalContributions - initialInvestment).toLocaleString('en-US')}`;
        document.getElementById('interest-earned').textContent = `$${interestEarned.toLocaleString('en-US')}`;
        document.getElementById('final-balance').textContent = `$${balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        document.getElementById('inflation-adjusted').textContent = `$${inflationAdjusted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        document.getElementById('after-taxes').textContent = `$${afterTaxes.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

        this.generatePerformanceTable(yearlyData);
        this.generateChart(initialInvestment, totalContributions - initialInvestment, interestEarned);
        document.getElementById('investment-results').style.display = 'block';
    }

    generatePerformanceTable(data) {
        const performanceBody = document.getElementById('performance-body');
        performanceBody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.year}</td>
                <td>$${item.startingBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>$${item.contributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>$${item.interest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>$${item.endingBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            `;
            performanceBody.appendChild(row);
        });
    }

    generateChart(initial, contributions, interest) {
        const ctx = document.getElementById('investment-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Initial Investment', 'Contributions', 'Interest Earned'],
                datasets: [{
                    label: 'Investment Growth',
                    data: [initial, contributions, interest],
                    backgroundColor: ['#4361ee', '#3a0ca3', '#4cc9f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value.toLocaleString('en-US')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString('en-US');
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('calculate-investment').addEventListener('click', () => this.calculate());
    }
}
