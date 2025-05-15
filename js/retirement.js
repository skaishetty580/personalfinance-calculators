class RetirementCalculator {
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
        this.setupEventListeners();
    }

    calculate() {
        // Show loading state
        const calculateBtn = this.container.querySelector('#calculate-retirement');
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        // Use setTimeout to allow UI to update before heavy calculations
        setTimeout(() => {
            try {
                // Get input values
                const currentAge = parseInt(this.container.querySelector('#current-age').value) || 35;
                const retirementAge = parseInt(this.container.querySelector('#retirement-age').value) || 65;
                const currentSavings = parseFloat(this.container.querySelector('#current-savings').value) || 100000;
                const monthlyContribution = parseFloat(this.container.querySelector('#monthly-contribution').value) || 1000;
                const annualReturn = parseFloat(this.container.querySelector('#annual-return').value) || 7;
                const retirementReturn = parseFloat(this.container.querySelector('#retirement-return').value) || 5;
                const inflationRate = parseFloat(this.container.querySelector('#inflation-rate').value) || 2.5;
                const retirementYears = parseInt(this.container.querySelector('#retirement-years').value) || 30;
                const monthlyIncome = parseFloat(this.container.querySelector('#monthly-income').value) || 5000;
                
                // Validate inputs
                if (retirementAge <= currentAge) {
                    alert('Retirement age must be greater than current age');
                    return;
                }
                
                // Calculate working years and retirement years
                const workingYears = retirementAge - currentAge;
                const totalYears = workingYears + retirementYears;
                
                // Calculate retirement savings at retirement age
                let savings = currentSavings;
                const workingProjection = [];
                const monthlyRate = annualReturn / 100 / 12;
                const months = workingYears * 12;
                
                // Track yearly totals
                let yearlyContributions = 0;
                let yearlyInterest = 0;
                
                for (let i = 0; i < months; i++) {
                    const interest = savings * monthlyRate;
                    savings += interest + monthlyContribution;
                    
                    yearlyContributions += monthlyContribution;
                    yearlyInterest += interest;
                    
                    // Record yearly values
                    if (i % 12 === 11 || i === months - 1) {
                        const year = Math.floor(i / 12) + 1;
                        workingProjection.push({
                            age: currentAge + year,
                            year,
                            balance: savings,
                            contributions: yearlyContributions,
                            interest: yearlyInterest,
                            withdrawals: 0
                        });
                        
                        // Reset yearly totals
                        yearlyContributions = 0;
                        yearlyInterest = 0;
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
                
                // Track yearly totals
                let yearlyWithdrawals = 0;
                yearlyInterest = 0;
                
                for (let i = 0; i < retirementMonths; i++) {
                    // Adjust income for inflation annually
                    if (i % 12 === 0 && i > 0) {
                        annualIncome *= (1 + (inflationRate / 100));
                    }
                    
                    const monthlyWithdrawal = annualIncome / 12;
                    const interest = retirementBalance * retirementMonthlyRate;
                    retirementBalance += interest - monthlyWithdrawal;
                    
                    yearlyWithdrawals += monthlyWithdrawal;
                    yearlyInterest += interest;
                    totalWithdrawals += monthlyWithdrawal;
                    
                    if (retirementBalance <= 0) {
                        retirementBalance = 0;
                        savingsDepleted = true;
                    }
                    
                    // Record yearly values
                    if (i % 12 === 11 || i === retirementMonths - 1 || retirementBalance <= 0) {
                        const year = workingYears + Math.floor(i / 12) + 1;
                        retirementProjection.push({
                            age: currentAge + year,
                            year,
                            balance: retirementBalance,
                            contributions: 0,
                            interest: yearlyInterest,
                            withdrawals: yearlyWithdrawals
                        });
                        
                        // Reset yearly totals
                        yearlyWithdrawals = 0;
                        yearlyInterest = 0;
                        
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
                this.container.querySelector('#retirement-savings').textContent = `$${retirementSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
                this.container.querySelector('#annual-withdrawal').textContent = `$${(monthlyIncome * 12).toLocaleString('en-US')}/year`;
                this.container.querySelector('#savings-shortfall').textContent = savingsShortfall > 0 ? 
                    `$${savingsShortfall.toLocaleString('en-US', {maximumFractionDigits: 0})}` : 'None';
                this.container.querySelector('#total-contributions').textContent = `$${totalContributions.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
                this.container.querySelector('#interest-earned').textContent = `$${interestEarned.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
                this.container.querySelector('#inflation-adjusted-income').textContent = `$${inflationAdjustedIncome.toLocaleString('en-US', {maximumFractionDigits: 0})}/month`;
                
                // Generate projection table
                this.generateProjectionTable(fullProjection);
                
                // Generate chart
                this.generateChart(fullProjection);
                
                // Show results
                this.container.querySelector('#retirement-results').style.display = 'block';
                
            } catch (error) {
                console.error('Calculation error:', error);
                alert('An error occurred during calculation');
            } finally {
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = '<i class="fas fa-umbrella-beach"></i> Calculate Retirement Plan';
            }
        }, 10);
    }

    generateProjectionTable(projection) {
        const projectionBody = this.container.querySelector('#projection-body');
        projectionBody.innerHTML = '';
        
        // Show all years in the table
        projection.forEach(item => {
            const row = document.createElement('tr');
            
            // Highlight retirement year
            if (item.withdrawals > 0 && item.contributions === 0) {
                row.classList.add('retirement-year');
            }
            
            // Highlight if balance is zero
            if (item.balance <= 0) {
                row.classList.add('zero-balance');
            }
            
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
        const ctx = this.container.querySelector('#retirement-chart').getContext('2d');
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
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: 'Contributions',
                        data: contributions,
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Withdrawals',
                        data: withdrawals,
                        borderColor: '#f72585',
                        backgroundColor: 'rgba(247, 37, 133, 0.1)',
                        borderDash: [5, 5],
                        borderWidth: 1,
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
        this.container.querySelector('#calculate-retirement').addEventListener('click', () => this.calculate());
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RetirementCalculator;
} else {
    window.RetirementCalculator = RetirementCalculator;
}
