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
                        <input type="number" id="initial-investment" placeholder="10,000" min="0">
                    </div>
                    <div class="input-group">
                        <label for="monthly-contribution">Monthly Contribution ($)</label>
                        <input type="number" id="monthly-contribution" placeholder="500" min="0">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="investment-years">Investment Period (years)</label>
                        <input type="number" id="investment-years" placeholder="20" min="1" max="60">
                    </div>
                    <div class="input-group">
                        <label for="expected-return">Expected Annual Return (%)</label>
                        <input type="number" id="expected-return" placeholder="7" step="0.1" min="0" max="30">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="inflation-rate">Inflation Rate (%)</label>
                        <input type="number" id="inflation-rate" placeholder="2.5" step="0.1" min="0" max="10">
                    </div>
                    <div class="input-group">
                        <label for="contribution-increase">Annual Contribution Increase (%)</label>
                        <input type="number" id="contribution-increase" placeholder="3" step="0.1" min="0" max="20">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="tax-rate">Tax Rate (%)</label>
                        <input type="number" id="tax-rate" placeholder="15" min="0" max="50">
                    </div>
                    <div class="input-group">
                        <label for="account-type">Account Type</label>
                        <select id="account-type">
                            <option value="taxable">Taxable Account</option>
                            <option value="roth">Roth IRA</option>
                            <option value="traditional">Traditional IRA/401k</option>
                        </select>
                    </div>
                </div>
                
                <button id="calculate-investment" class="calculate-btn">Calculate Investment Growth</button>
            </div>
            
            <div id="investment-results" class="results-container" style="display: none;">
                <h3 class="results-title">Investment Projection</h3>
                <div id="investment-summary" class="summary-grid"></div>
                
                <div class="results-section">
                    <h4>Growth Over Time</h4>
                    <div class="chart-container">
                        <canvas id="growth-chart"></canvas>
                    </div>
                </div>
                
                <div class="results-section">
                    <h4>Year-by-Year Projection</h4>
                    <div class="table-container">
                        <table id="projection-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Starting Balance</th>
                                    <th>Contributions</th>
                                    <th>Growth</th>
                                    <th>Ending Balance</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('calculate-investment').addEventListener('click', () => this.calculate());
    }

    calculate() {
        // Get input values
        const initial = parseFloat(document.getElementById('initial-investment').value) || 0;
        const monthly = parseFloat(document.getElementById('monthly-contribution').value) || 0;
        const years = parseInt(document.getElementById('investment-years').value) || 20;
        const returnRate = parseFloat(document.getElementById('expected-return').value) || 7;
        const inflation = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        const contributionIncrease = parseFloat(document.getElementById('contribution-increase').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 15;
        const accountType = document.getElementById('account-type').value;
        
        // Calculate values
        const monthlyRate = returnRate / 100 / 12;
        const months = years * 12;
        let balance = initial;
        let totalContributions = initial;
        let currentMonthly = monthly;
        const projection = [];
        const labels = [];
        const balanceData = [];
        const contributionData = [];
        const growthData = [];
        
        for (let year = 1; year <= years; year++) {
            const yearlyContribution = currentMonthly * 12;
            const startBalance = balance;
            
            for (let month = 1; month <= 12; month++) {
                balance = balance * (1 + monthlyRate) + currentMonthly;
                totalContributions += currentMonthly;
            }
            
            // Apply annual contribution increase
            currentMonthly *= (1 + contributionIncrease / 100);
            
            const yearlyGrowth = balance - startBalance - yearlyContribution;
            
            projection.push({
                year,
                startBalance,
                contributions: yearlyContribution,
                growth: yearlyGrowth,
                endBalance: balance
            });
            
            labels.push(`Year ${year}`);
            balanceData.push(balance);
            contributionData.push(totalContributions);
            growthData.push(yearlyGrowth);
        }
        
        // Adjust for taxes based on account type
        let afterTaxBalance = balance;
        let taxImpact = 0;
        
        switch(accountType) {
            case 'traditional':
                afterTaxBalance = balance * (1 - taxRate / 100);
                taxImpact = balance - afterTaxBalance;
                break;
            case 'taxable':
                const growth = balance - totalContributions;
                afterTaxBalance = totalContributions + (growth * (1 - taxRate / 100));
                taxImpact = growth * (taxRate / 100);
                break;
            case 'roth':
                // No taxes on Roth
                break;
        }
        
        // Calculate inflation-adjusted value
        const inflationAdjusted = afterTaxBalance / Math.pow(1 + inflation / 100, years);
        
        // Display results
        document.getElementById('investment-summary').innerHTML = `
            <div class="summary-card">
                <h4>Future Value</h4>
                <p class="summary-value">$${balance.toFixed(2)}</p>
                <div class="breakdown">
                    <span>Contributions: $${totalContributions.toFixed(2)}</span>
                    <span>Growth: $${(balance - totalContributions).toFixed(2)}</span>
                </div>
            </div>
            <div class="summary-card">
                <h4>After-Tax Value</h4>
                <p class="summary-value">$${afterTaxBalance.toFixed(2)}</p>
                ${taxImpact > 0 ? `<div class="breakdown"><span>Taxes: $${taxImpact.toFixed(2)}</span></div>` : ''}
            </div>
            <div class="summary-card">
                <h4>Inflation-Adjusted</h4>
                <p class="summary-value">$${inflationAdjusted.toFixed(2)}</p>
                <div class="breakdown">
                    <span>Today's dollars at ${inflation}% inflation</span>
                </div>
            </div>
            <div class="summary-card">
                <h4>Annual Return</h4>
                <p class="summary-value">${returnRate}%</p>
                <div class="breakdown">
                    <span>Compounded monthly</span>
                </div>
            </div>
        `;
        
        // Generate projection table
        let projectionHTML = '';
        projection.forEach((item, index) => {
            if (index % 5 === 0 || index === projection.length - 1) {
                projectionHTML += `
                    <tr>
                        <td>${item.year}</td>
                        <td>$${item.startBalance.toFixed(2)}</td>
                        <td>$${item.contributions.toFixed(2)}</td>
                        <td>$${item.growth.toFixed(2)}</td>
                        <td>$${item.endBalance.toFixed(2)}</td>
                    </tr>
                `;
            }
        });
        
        document.querySelector('#projection-table tbody').innerHTML = projectionHTML;
        
        // Create chart
        this.createGrowthChart(labels, balanceData, contributionData, growthData);
        
        // Show results
        document.getElementById('investment-results').style.display = 'block';
    }

    createGrowthChart(labels, balanceData, contributionData, growthData) {
        const ctx = document.getElementById('growth-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.growthChart) {
            this.growthChart.destroy();
        }
        
        this.growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Balance',
                        data: balanceData,
                        backgroundColor: 'rgba(67, 97, 238, 0.2)',
                        borderColor: '#4361ee',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Total Contributions',
                        data: contributionData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}
