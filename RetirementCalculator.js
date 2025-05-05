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
                        <input type="number" id="current-age" placeholder="35" min="18" max="100">
                    </div>
                    <div class="input-group">
                        <label for="retirement-age">Retirement Age</label>
                        <input type="number" id="retirement-age" placeholder="65" min="25" max="100">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="current-savings">Current Retirement Savings ($)</label>
                        <input type="number" id="current-savings" placeholder="100,000" min="0">
                    </div>
                    <div class="input-group">
                        <label for="annual-contribution">Annual Contribution ($)</label>
                        <input type="number" id="annual-contribution" placeholder="12,000" min="0">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="pre-retirement-return">Pre-Retirement Return (%)</label>
                        <input type="number" id="pre-retirement-return" placeholder="7" step="0.1" min="0" max="30">
                    </div>
                    <div class="input-group">
                        <label for="post-retirement-return">Post-Retirement Return (%)</label>
                        <input type="number" id="post-retirement-return" placeholder="5" step="0.1" min="0" max="30">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="retirement-spending">Annual Retirement Spending ($)</label>
                        <input type="number" id="retirement-spending" placeholder="50,000" min="0">
                    </div>
                    <div class="input-group">
                        <label for="inflation-rate">Inflation Rate (%)</label>
                        <input type="number" id="inflation-rate" placeholder="2.5" step="0.1" min="0" max="10">
                    </div>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="social-security">Annual Social Security ($)</label>
                        <input type="number" id="social-security" placeholder="20,000" min="0">
                    </div>
                    <div class="input-group">
                        <label for="life-expectancy">Life Expectancy Age</label>
                        <input type="number" id="life-expectancy" placeholder="90" min="65" max="120">
                    </div>
                </div>
                
                <button id="calculate-retirement" class="calculate-btn">Calculate Retirement Plan</button>
            </div>
            
            <div id="retirement-results" class="results-container" style="display: none;">
                <h3 class="results-title">Retirement Projection</h3>
                <div id="retirement-summary" class="summary-grid"></div>
                
                <div class="results-section">
                    <h4>Retirement Readiness</h4>
                    <div class="chart-container">
                        <canvas id="retirement-chart"></canvas>
                    </div>
                </div>
                
                <div class="results-section">
                    <h4>Year-by-Year Projection</h4>
                    <div class="table-container">
                        <table id="projection-table">
                            <thead>
                                <tr>
                                    <th>Age</th>
                                    <th>Savings</th>
                                    <th>Withdrawals</th>
                                    <th>Growth</th>
                                    <th>Net Change</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                
                <div class="results-section">
                    <h4>Monte Carlo Simulation</h4>
                    <div class="simulation-container">
                        <div class="simulation-controls">
                            <label for="simulation-count">Number of Simulations:</label>
                            <input type="number" id="simulation-count" value="1000" min="100" max="10000">
                            <button id="run-simulation" class="secondary-btn">Run Simulation</button>
                        </div>
                        <div class="chart-container">
                            <canvas id="simulation-chart"></canvas>
                        </div>
                        <div id="simulation-results"></div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('calculate-retirement').addEventListener('click', () => this.calculate());
        document.getElementById('run-simulation').addEventListener('click', () => this.runMonteCarloSimulation());
    }

    calculate() {
        // Get input values
        const currentAge = parseInt(document.getElementById('current-age').value) || 35;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 90;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
        const annualContribution = parseFloat(document.getElementById('annual-contribution').value) || 0;
        const preReturn = parseFloat(document.getElementById('pre-retirement-return').value) || 7;
        const postReturn = parseFloat(document.getElementById('post-retirement-return').value) || 5;
        const retirementSpending = parseFloat(document.getElementById('retirement-spending').value) || 0;
        const inflation = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        const socialSecurity = parseFloat(document.getElementById('social-security').value) || 0;
        
        // Validate inputs
        if (retirementAge <= currentAge) {
            alert('Retirement age must be greater than current age');
            return;
        }
        
        if (lifeExpectancy <= retirementAge) {
            alert('Life expectancy must be greater than retirement age');
            return;
        }
        
        // Calculate working and retirement years
        const workingYears = retirementAge - currentAge;
        const retirementYears = lifeExpectancy - retirementAge;
        
        // Accumulation phase
        let savings = currentSavings;
        const accumulation = [];
        const labels = [];
        const savingsData = [];
        const contributionData = [];
        
        for (let year = 1; year <= workingYears; year++) {
            const age = currentAge + year;
            const growth = savings * (preReturn / 100);
            savings = (savings + annualContribution) * (1 + preReturn / 100);
            
            accumulation.push({
                age,
                savings,
                contribution: annualContribution,
                growth,
                withdrawal: 0,
                netChange: annualContribution + growth
            });
            
            labels.push(`Age ${age}`);
            savingsData.push(savings);
            contributionData.push(annualContribution);
        }
        
        // Retirement phase
        const retirement = [];
        let retirementSavings = savings;
        let failed = false;
        
        for (let year = 1; year <= retirementYears; year++) {
            const age = retirementAge + year;
            const inflationAdjustedSpending = retirementSpending * Math.pow(1 + inflation / 100, year - 1);
            const inflationAdjustedSS = socialSecurity * Math.pow(1 + inflation / 100, year - 1);
            const netWithdrawal = Math.max(0, inflationAdjustedSpending - inflationAdjustedSS);
            const growth = retirementSavings * (postReturn / 100);
            
            retirementSavings = (retirementSavings - netWithdrawal) * (1 + postReturn / 100);
            
            retirement.push({
                age,
                savings: retirementSavings,
                contribution: 0,
                growth,
                withdrawal: netWithdrawal,
                netChange: growth - netWithdrawal
            });
            
            labels.push(`Age ${age}`);
            savingsData.push(retirementSavings);
            contributionData.push(0);
            
            if (retirementSavings <= 0) {
                failed = true;
                break;
            }
        }
        
        // Combine results
        const projection = [...accumulation, ...retirement];
        const finalYear = projection[projection.length - 1];
        
        // Display results
        document.getElementById('retirement-summary').innerHTML = `
            <div class="summary-card">
                <h4>Savings at Retirement</h4>
                <p class="summary-value">$${savings.toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
            </div>
            <div class="summary-card">
                <h4>Annual Withdrawal</h4>
                <p class="summary-value">$${retirementSpending.toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
                <div class="breakdown">
                    <span>After Social Security: $${Math.max(0, retirementSpending - socialSecurity).toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
                </div>
            </div>
            <div class="summary-card">
                <h4>Funds Last Until</h4>
                <p class="summary-value">${failed ? `Age ${finalYear.age} (${finalYear.age - retirementAge} years)` : 'Beyond Life Expectancy'}</p>
            </div>
            <div class="summary-card">
                <h4>Inflation-Adjusted</h4>
                <p class="summary-value">${inflation}% annually</p>
            </div>
        `;
        
        // Generate projection table
        let projectionHTML = '';
        projection.forEach((item, index) => {
            if (index % 5 === 0 || index === projection.length - 1) {
                projectionHTML += `
                    <tr>
                        <td>${item.age}</td>
                        <td>$${item.savings.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                        <td>$${item.withdrawal.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                        <td>$${item.growth.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                        <td class="${item.netChange >= 0 ? 'positive' : 'negative'}">
                            $${item.netChange.toLocaleString('en-US', {maximumFractionDigits: 2})}
                        </td>
                    </tr>
                `;
            }
        });
        
        document.querySelector('#projection-table tbody').innerHTML = projectionHTML;
        
        // Create chart
        this.createRetirementChart(labels, savingsData, contributionData, retirementAge - currentAge);
        
        // Show results
        document.getElementById('retirement-results').style.display = 'block';
    }

    createRetirementChart(labels, savingsData, contributionData, retirementYearIndex) {
        const ctx = document.getElementById('retirement-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.retirementChart) {
            this.retirementChart.destroy();
        }
        
        this.retirementChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Retirement Savings',
                        data: savingsData,
                        backgroundColor: 'rgba(67, 97, 238, 0.2)',
                        borderColor: '#4361ee',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Annual Contributions',
                        data: contributionData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
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
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 0,
                                yMax: 0,
                                xMin: retirementYearIndex,
                                xMax: retirementYearIndex,
                                borderColor: '#f72585',
                                borderWidth: 2,
                                label: {
                                    content: 'Retirement',
                                    enabled: true,
                                    position: 'top'
                                }
                            }
                        }
                    },
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

    runMonteCarloSimulation() {
        // Get input values
        const currentAge = parseInt(document.getElementById('current-age').value) || 35;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 90;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
        const annualContribution = parseFloat(document.getElementById('annual-contribution').value) || 0;
        const preReturn = parseFloat(document.getElementById('pre-retirement-return').value) || 7;
        const postReturn = parseFloat(document.getElementById('post-retirement-return').value) || 5;
        const retirementSpending = parseFloat(document.getElementById('retirement-spending').value) || 0;
        const inflation = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        const socialSecurity = parseFloat(document.getElementById('social-security').value) || 0;
        const simulations = parseInt(document.getElementById('simulation-count').value) || 1000;
        
        const workingYears = retirementAge - currentAge;
        const retirementYears = lifeExpectancy - retirementAge;
        
        // Run simulations
        let successCount = 0;
        const successRates = [];
        const endBalances = [];
        const volatility = preReturn * 0.5; // Standard deviation for returns
        
        for (let i = 0; i < simulations; i++) {
            let savings = currentSavings;
            
            // Accumulation phase with random returns
            for (let year = 1; year <= workingYears; year++) {
                const returnRate = this.getRandomReturn(preReturn, volatility);
                savings = (savings + annualContribution) * (1 + returnRate / 100);
            }
            
            // Retirement phase with random returns and inflation
            let retirementSavings = savings;
            let failed = false;
            
            for (let year = 1; year <= retirementYears; year++) {
                const inflationAdjustedSpending = retirementSpending * Math.pow(1 + inflation / 100, year - 1);
                const inflationAdjustedSS = socialSecurity * Math.pow(1 + inflation / 100, year - 1);
                const netWithdrawal = Math.max(0, inflationAdjustedSpending - inflationAdjustedSS);
                const returnRate = this.getRandomReturn(postReturn, volatility * 0.7); // Less volatile in retirement
                
                retirementSavings = (retirementSavings - netWithdrawal) * (1 + returnRate / 100);
                
                if (retirementSavings <= 0) {
                    failed = true;
                    break;
                }
            }
            
            if (!failed) {
                successCount++;
            }
            
            endBalances.push(retirementSavings);
            
            // Track success rate every 100 simulations for chart
            if (i % 100 === 0 || i === simulations - 1) {
                successRates.push({
                    simulations: i + 1,
                    rate: (successCount / (i + 1)) * 100
                });
            }
        }
        
        const successRate = (successCount / simulations) * 100;
        
        // Display simulation results
        document.getElementById('simulation-results').innerHTML = `
            <div class="simulation-summary">
                <div class="simulation-metric">
                    <h4>Success Rate</h4>
                    <p class="${successRate >= 80 ? 'positive' : successRate >= 50 ? 'warning' : 'negative'}">
                        ${successRate.toFixed(1)}%
                    </p>
                </div>
                <div class="simulation-metric">
                    <h4>Median Ending Balance</h4>
                    <p>$${this.median(endBalances).toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
                </div>
                <div class="simulation-metric">
                    <h4>Best Case</h4>
                    <p>$${Math.max(...endBalances).toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
                </div>
                <div class="simulation-metric">
                    <h4>Worst Case</h4>
                    <p>$${Math.min(...endBalances).toLocaleString('en-US', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            
            <div class="simulation-assessment">
                <h4>Assessment:</h4>
                <p>${
                    successRate >= 90 ? 'Your plan is very secure with a high probability of success.' :
                    successRate >= 75 ? 'Your plan is likely to succeed but could benefit from small adjustments.' :
                    successRate >= 50 ? 'Your plan has significant risk and should be reviewed carefully.' :
                    'Your plan is very risky and unlikely to succeed without changes.'
                }</p>
                ${
                    successRate < 75 ? 
                    '<p>Consider increasing savings, reducing spending, working longer, or adjusting your investment strategy.</p>' : 
                    ''
                }
            </div>
        `;
        
        // Create simulation chart
        this.createSimulationChart(successRates);
    }

    getRandomReturn(meanReturn, volatility) {
        // Simple normal distribution approximation
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        
        return meanReturn + normal * volatility;
    }

    median(values) {
        if (values.length === 0) return 0;
        
        values.sort((a, b) => a - b);
        const half = Math.floor(values.length / 2);
        
        if (values.length % 2) {
            return values[half];
        }
        
        return (values[half - 1] + values[half]) / 2;
    }

    createSimulationChart(successRates) {
        const ctx = document.getElementById('simulation-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.simulationChart) {
            this.simulationChart.destroy();
        }
        
        this.simulationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: successRates.map(item => item.simulations),
                datasets: [
                    {
                        label: 'Success Rate',
                        data: successRates.map(item => item.rate),
                        backgroundColor: 'rgba(67, 97, 238, 0.2)',
                        borderColor: '#4361ee',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: '80% Target',
                        data: Array(successRates.length).fill(80),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}
