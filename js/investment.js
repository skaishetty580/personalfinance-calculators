class InvestmentCalculator {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.yearlyData = [];
        this.renderForm();
        
    }

    renderForm() {
        this.container.innerHTML = `
            <div class="calculator-form">
                <div class="input-row">
                    <div class="input-group">
                        <label for="initial-investment">Initial Investment ($)</label>
                        <input type="number" id="initial-investment" placeholder="0" min="0" value="0">
                    </div>
                    <div class="input-group">
                        <label for="monthly-contribution">Monthly Contribution ($)</label>
                        <input type="number" id="monthly-contribution" placeholder="0" min="0" value="0">
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-group">
                        <label for="investment-years">Investment Period (years)</label>
                        <input type="number" id="investment-years" placeholder="0" min="1" max="100" value="0">
                    </div>
                    <div class="input-group">
                        <label for="expected-return">Expected Return (%)</label>
                        <input type="number" id="expected-return" placeholder="0" step="0.01" min="0" max="50" value="0">
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
                    Calculate Investment Growth
                </button>

                <div id="investment-results" class="results-container" style="display: none;">
                    <h3>Investment Projection Summary</h3>

                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Initial Investment</h4>
                            <p id="initial-investment-result">$0.00</p>
                        </div>
                        <div class="result-item">
                            <h4>Total Contributions</h4>
                            <p id="total-contributions">$0.00</p>
                        </div>
                        <div class="result-item">
                            <h4>Interest Earned</h4>
                            <p id="interest-earned">$0.00</p>
                        </div>
                        <div class="result-item">
                            <h4>Final Balance</h4>
                            <p id="final-balance">$0.00</p>
                        </div>
                    </div>

                    <div class="chart-container" style="margin-top: 30px;">
                        <canvas id="investment-chart"></canvas>
                    </div>

                    <div id="performance-table" class="performance-table" style="margin-top: 40px;">
                        <h3>Year-by-Year Growth</h3>
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
        this.setupEventListeners();
    }

    parseInputValue(id) {
        const element = document.getElementById(id);
        const value = element.value.replace(/,/g, '');
        return value ? parseFloat(value) : 0;
    }

    formatCurrency(value) {
        return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    calculate() {
        const initialInvestment = this.parseInputValue('initial-investment');
        const monthlyContribution = this.parseInputValue('monthly-contribution');
        const years = this.parseInputValue('investment-years');
        const expectedReturn = this.parseInputValue('expected-return');
        const compoundFrequency = parseInt(document.getElementById('compound-frequency').value);

        if (years < 1) {
            alert('Investment Period must be at least 1 year');
            return;
        }

        const periodicRate = expectedReturn / 100 / compoundFrequency;
        const periodicContribution = monthlyContribution * (12 / compoundFrequency);

        let balance = initialInvestment;
        let totalContributions = 0;
        this.yearlyData = [];

        for (let year = 1; year <= years; year++) {
            const startingBalance = balance;
            let yearContributions = 0;
            let yearInterest = 0;

            for (let p = 0; p < compoundFrequency; p++) {
                balance += periodicContribution;
                yearContributions += periodicContribution;

                const earned = balance * periodicRate;
                balance += earned;
                yearInterest += earned;
            }

            totalContributions += yearContributions;

            this.yearlyData.push({
                year,
                startingBalance,
                contributions: yearContributions,
                interest: yearInterest,
                endingBalance: balance
            });
        }

        const totalInvested = initialInvestment + totalContributions;
        const interestEarned = balance - totalInvested;

        this.displayResults(initialInvestment, totalContributions, interestEarned, balance);
        this.generatePerformanceTable();
        this.generateChart(initialInvestment, totalContributions, interestEarned);

        document.getElementById('investment-results').style.display = 'block';
    }

    displayResults(initialInvestment, totalContributions, interestEarned, balance) {
        document.getElementById('initial-investment-result').textContent = this.formatCurrency(initialInvestment);
        document.getElementById('total-contributions').textContent = this.formatCurrency(totalContributions);
        document.getElementById('interest-earned').textContent = this.formatCurrency(interestEarned);
        document.getElementById('final-balance').textContent = this.formatCurrency(balance);
    }

    generatePerformanceTable() {
        const tbody = document.getElementById('performance-body');
        tbody.innerHTML = '';

        this.yearlyData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.year}</td>
                <td>${this.formatCurrency(item.startingBalance)}</td>
                <td>${this.formatCurrency(item.contributions)}</td>
                <td>${this.formatCurrency(item.interest)}</td>
                <td>${this.formatCurrency(item.endingBalance)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    generateChart(initial, contributions, interest) {
        const ctx = document.getElementById('investment-chart').getContext('2d');
        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Initial Investment', 'Contributions', 'Interest Earned'],
                datasets: [{
                    data: [initial, contributions, interest],
                    backgroundColor: ['#4361ee', '#3a0ca3', '#4cc9f0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('calculate-investment').addEventListener('click', (e) => {
            e.preventDefault();
            this.calculate();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('investment-calculator');
    if (container) {
        new InvestmentCalculator(container);
    }
});
