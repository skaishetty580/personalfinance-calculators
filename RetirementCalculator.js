class RetirementCalculator {
    constructor(container) {
        this.container = container;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div id="retirement-calculator" class="calculator">
                <h2>Retirement Planner</h2>
                <div class="input-group">
                    <label for="current-age">Current Age</label>
                    <input type="number" id="current-age" placeholder="35">
                </div>
                <div class="input-group">
                    <label for="retirement-age">Retirement Age</label>
                    <input type="number" id="retirement-age" placeholder="65">
                </div>
                <div class="input-group">
                    <label for="life-expectancy">Life Expectancy</label>
                    <input type="number" id="life-expectancy" placeholder="90">
                </div>
                <div class="input-group">
                    <label for="current-savings">Current Retirement Savings ($)</label>
                    <input type="number" id="current-savings" placeholder="100,000">
                </div>
                <div class="input-group">
                    <label for="annual-contribution">Annual Contribution ($)</label>
                    <input type="number" id="annual-contribution" placeholder="12,000">
                </div>
                <div class="input-group">
                    <label for="retirement-return">Pre-Retirement Return (%)</label>
                    <input type="number" id="retirement-return" placeholder="7" step="0.1">
                </div>
                <div class="input-group">
                    <label for="post-retirement-return">Post-Retirement Return (%)</label>
                    <input type="number" id="post-retirement-return" placeholder="5" step="0.1">
                </div>
                <div class="input-group">
                    <label for="retirement-spending">Annual Retirement Spending ($)</label>
                    <input type="number" id="retirement-spending" placeholder="50,000">
                </div>
                <button id="calculate-retirement">Calculate Retirement Plan</button>
                <div id="retirement-results" class="results" style="display: none;">
                    <h3>Retirement Projection</h3>
                    <div id="retirement-summary"></div>
                    <table id="retirement-table">
                        <thead>
                            <tr>
                                <th>Age</th>
                                <th>Savings</th>
                                <th>Withdrawals</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('calculate-retirement').addEventListener('click', () => this.calculate());
    }

    calculate() {
        const currentAge = parseInt(document.getElementById('current-age').value) || 35;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 90;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 100000;
        const annualContribution = parseFloat(document.getElementById('annual-contribution').value) || 12000;
        const preReturn = parseFloat(document.getElementById('retirement-return').value) || 7;
        const postReturn = parseFloat(document.getElementById('post-retirement-return').value) || 5;
        const retirementSpending = parseFloat(document.getElementById('retirement-spending').value) || 50000;
        
        let balance = currentSavings;
        let retirementHTML = '';
        const workingYears = retirementAge - currentAge;
        const retirementYears = lifeExpectancy - retirementAge;
        
        for (let year = 1; year <= workingYears; year++) {
            balance = (balance + annualContribution) * (1 + preReturn / 100);
            
            retirementHTML += `
                <tr>
                    <td>${currentAge + year}</td>
                    <td>$${balance.toFixed(2)}</td>
                    <td>$0</td>
                    <td>$${(balance * (preReturn / 100)).toFixed(2)}</td>
                </tr>
            `;
        }
        
        for (let year = 1; year <= retirementYears; year++) {
            const withdrawal = retirementSpending;
            balance = (balance - withdrawal) * (1 + postReturn / 100);
            
            retirementHTML += `
                <tr>
                    <td>${retirementAge + year}</td>
                    <td>$${Math.max(0, balance).toFixed(2)}</td>
                    <td>$${withdrawal.toFixed(2)}</td>
                    <td>$${(Math.max(0, balance) * (postReturn / 100)).toFixed(2)}</td>
                </tr>
            `;
            
            if (balance <= 0) break;
        }
        
        document.getElementById('retirement-summary').innerHTML = `
            <p><strong>Savings at Retirement:</strong> $${(currentSavings * Math.pow(1 + preReturn / 100, workingYears) + 
                annualContribution * (Math.pow(1 + preReturn / 100, workingYears) - 1) / (preReturn / 100)).toFixed(2)}</p>
            <p><strong>Annual Withdrawal:</strong> $${retirementSpending.toFixed(2)}</p>
            <p><strong>Years of Withdrawals:</strong> ${balance > 0 ? retirementYears : 'Funds depleted before life expectancy'}</p>
        `;
        
        document.querySelector('#retirement-table tbody').innerHTML = retirementHTML;
        document.getElementById('retirement-results').style.display = 'block';
    }
}