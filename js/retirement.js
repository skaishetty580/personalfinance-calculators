class RetirementCalculator {
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
                        <label for="current-age">Current Age</label>
                        <input type="number" id="current-age" placeholder="35">
                    </div>
                    <div class="input-group">
                        <label for="retirement-age">Retirement Age</label>
                        <input type="number" id="retirement-age" placeholder="65">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="current-savings">Current Savings ($)</label>
                        <input type="number" id="current-savings" placeholder="100,000">
                    </div>
                    <div class="input-group">
                        <label for="monthly-contribution">Monthly Contribution ($)</label>
                        <input type="number" id="monthly-contribution" placeholder="1,000">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="annual-return">Annual Return Before Retirement (%)</label>
                        <input type="number" id="annual-return" placeholder="7" step="0.1">
                    </div>
                    <div class="input-group">
                        <label for="retirement-return">Annual Return During Retirement (%)</label>
                        <input type="number" id="retirement-return" placeholder="5" step="0.1">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="inflation-rate">Inflation Rate (%)</label>
                        <input type="number" id="inflation-rate" placeholder="2.5" step="0.1">
                    </div>
                    <div class="input-group">
                        <label for="retirement-years">Years in Retirement</label>
                        <input type="number" id="retirement-years" placeholder="30">
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="monthly-income">Desired Monthly Income ($)</label>
                    <input type="number" id="monthly-income" placeholder="5,000">
                </div>
                
                <button id="calculate-retirement" class="button cta-button">
                    <i class="fas fa-umbrella-beach"></i> Calculate Retirement Plan
                </button>
                
                <div id="retirement-results" class="results-container" style="display: none;">
                    <h3>Retirement Projection</h3>
                    
                    <div class="results-grid">
                        <div class="result-item">
                            <h4>Retirement Savings</h4>
                            <p id="retirement-savings">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Annual Withdrawal</h4>
                            <p id="annual-withdrawal">-</p>
                        </div>
                        <div class="result-item">
                            <h4>Savings Shortfall</h4>
                            <p id="savings-shortfall">-</p>
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
                            <h4>Inflation Adjusted Income</h4>
                            <p id="inflation-adjusted-income">-</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="retirement-chart"></canvas>
                    </div>
                    
                    <div class="projection-table">
                        <h4>Year-by-Year Projection</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Age</th>
                                        <th>Year</th>
                                        <th>Savings Balance</th>
                                        <th>Contributions</th>
                                        <th>Interest</th>
                                        <th>Withdrawals</th>
                                    </tr>
                                </thead>
                                <tbody id="projection-body">
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
        const currentAge = parseInt(document.getElementById('current-age').value) || 35;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 100000;
        const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 1000;
        const annualReturn = parseFloat(document.getElementById('annual-return').value) || 7;
        const retirementReturn = parseFloat(document.getElementById('retirement-return').value) || 5;
        const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        const retirementYears = parseInt(document.getElementById('retirement-years').value) || 30;
        const monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 5000;
        
        // Calculate working years and retirement years
        const workingYears = retirementAge - currentAge;
        const totalYears = workingYears + retirementYears;
        
        // Calculate retirement savings at retirement age
        let savings = currentSavings;
        const workingProjection = [];
        const monthlyRate = annualReturn / 100 / 12;
        const months = workingYears * 12;
        
        for (let i = 0; i < months; i++) {
            const interest = savings * monthlyRate;
            savings += interest + monthlyContribution;
            
            // Record yearly values
            if (i % 12 === 11) {
                const year = Math.floor(i / 12) + 1;
                workingProjection.push({
                    age: currentAge + year,
                    year,
                    balance: savings,
                    contributions: monthlyContribution * 12,
                    interest,
                    withdrawals: 0
                });
            }
        }
        
        const retirementSavings = savings;
        const totalContributions = currentSavings + (monthlyContribution * months);
        const interestEarned = retirementSavings - totalContributions;
        
        // Calculate retirement withdrawals
        let retirementBalance = retirementSavings;
        const retirementProjection = [];
        const retirementMonthlyRate = retirementReturn / 100 / 12;
        const retirementMonths = retirementYears * 12;
        let annualIncome = monthlyIncome * 12;
        let totalWithdrawals = 0;
        let savingsDepleted = false;
        
        for (let i = 0; i < retirementMonths; i++) {
            // Adjust income for inflation
            if (i % 12 === 0 && i > 0) {
                annualIncome *= (1 + (inflationRate / 100));
            }
            
            const monthlyWithdrawal = annualIncome / 12;
            const interest = retirementBalance * retirementMonthlyRate;
            retirementBalance += interest - monthlyWithdrawal;
            totalWithdrawals += monthlyWithdrawal;
            
            if (retirementBalance <= 0) {
                retirementBalance = 0;
                savingsDepleted = true;
            }
            
            // Record yearly values
            if (i % 12 === 11 || retirementBalance <= 0) {
                const year = workingYears + Math.floor(i / 12) + 1;
                retirementProjection.push({
                    age: currentAge + year,
                    year,
                    balance: retirementBalance,
                    contributions: 0,
                    interest,
                    withdrawals: monthlyWithdrawal * 12
                });
                
                if (retirementBalance <= 0) break;
            }
        }
        
        // Combine projections
        const fullProjection = [...workingProjection, ...retirementProjection];
        
        // Calculate results
        const requiredSavings = (monthlyIncome * 12 * retirementYears) / (retirementReturn / 100);
        const savingsShortfall = Math.max(0, requiredSavings - retirementSavings);
        const inflationAdjustedIncome = monthlyIncome * Math.pow(1 + (inflationRate / 100), workingYears);
        
        // Display results
        document.getElementById('retirement-savings').textContent = `$${retirementSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('annual-withdrawal').textContent = `$${(monthlyIncome * 12).toLocaleString('en-US')}/year`;
        document.getElementById('savings-shortfall').textContent = savingsShortfall > 0 ? 
            `$${savingsShortfall.toLocaleString('en-US', {maximumFractionDigits: 0})}` : 'None';
        document.getElementById('total-contributions').textContent = `$${totalContributions.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('interest-earned').textContent = `$${interestEarned.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('inflation-adjusted-income').textContent = `$${inflationAdjustedIncome.toLocaleString('en-US', {maximumFractionDigits: 0})}/month`;
        
        // Generate projection table
        this.generateProjectionTable(fullProjection);
        
        // Generate chart
        this.generateChart(fullProjection);
        
        // Show results
        document.getElementById('retirement-results').style.display = 'block';
    }

    generateProjectionTable(projection) {
        const projectionBody = document.getElementById('projection-body');
        projectionBody.innerHTML = '';
        
        // Only show every 5 years and final year for brevity
        const filteredProjection = projection.filter((item, index) => {
            return item.year % 5 === 0 || 
                   index === 0 || 
                   index === projection.length - 1;
        });
        
        filteredProjection.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.age}</td>
                <td>${item.year}</td>
                <td>$${item.balance.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td>$${item.contributions.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td>$${item.interest.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td>$${item.withdrawals.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
            `;
            projectionBody.appendChild(row);
        });
    }

    generateChart(projection) {
        const ctx = document.getElementById('retirement-chart').getContext('2d');
        const ages = projection.map(item => item.age);
        const balances = projection.map(item => item.balance);
        const contributions = projection.map(item => item.contributions);
        const withdrawals = projection.map(item => item.withdrawals);
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ages,
                datasets: [
                    {
                        label: 'Savings Balance',
                        data: balances,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Contributions',
                        data: contributions,
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        borderDash: [5, 5],
                        fill: false
                    },
                    {
                        label: 'Withdrawals',
                        data: withdrawals,
                        borderColor: '#f72585',
                        backgroundColor: 'rgba(247, 37, 133, 0.1)',
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
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
        document.getElementById('calculate-retirement').addEventListener('click', () => this.calculate());
    }
}
