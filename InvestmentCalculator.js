class InvestmentCalculator {
    constructor(container) {
        this.container = container;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div id="investment-calculator" class="calculator">
                <h2>Investment Calculator</h2>
                <div class="input-group">
                    <label for="initial-investment">Initial Investment ($)</label>
                    <input type="number" id="initial-investment" placeholder="10,000">
                </div>
                <div class="input-group">
                    <label for="monthly-contribution">Monthly Contribution ($)</label>
                    <input type="number" id="monthly-contribution" placeholder="500">
                </div>
                <div class="input-group">
                    <label for="investment-years">Investment Period (years)</label>
                    <input type="number" id="investment-years" placeholder="20">
                </div>
                <div class="input-group">
                    <label for="expected-return">Expected Annual Return (%)</label>
                    <input type="number" id="expected-return" placeholder="7" step="0.1">
                </div>
                <div class="input-group">
                    <label for="inflation-rate">Inflation Rate (%)</label>
                    <input type="number" id="inflation-rate" placeholder="2.5" step="0.1">
                </div>
                <button id="calculate-investment">Calculate</button>
                <div id="investment-results" class="results" style="display: none;">
                    <h3>Investment Projection</h3>
                    <div id="investment-summary"></div>
                    <table id="investment-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Balance</th>
                                <th>Contributions</th>
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
        document.getElementById('calculate-investment').addEventListener('click', () => this.calculate());
    }

    calculate() {
        const initial = parseFloat(document.getElementById('initial-investment').value) || 10000;
        const monthly = parseFloat(document.getElementById('monthly-contribution').value) || 500;
        const years = parseInt(document.getElementById('investment-years').value) || 20;
        const returnRate = parseFloat(document.getElementById('expected-return').value) || 7;
        const inflation = parseFloat(document.getElementById('inflation-rate').value) || 2.5;
        
        const monthlyRate = returnRate / 100 / 12;
        const months = years * 12;
        let balance = initial;
        let totalContributions = initial;
        let projectionHTML = '';
        
        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                balance = balance * (1 + monthlyRate) + monthly;
            }
            totalContributions += monthly * 12;
            
            projectionHTML += `
                <tr>
                    <td>${year}</td>
                    <td>$${balance.toFixed(2)}</td>
                    <td>$${totalContributions.toFixed(2)}</td>
                    <td>$${(balance - totalContributions).toFixed(2)}</td>
                </tr>
            `;
        }
        
        const inflationAdjusted = balance / Math.pow(1 + inflation / 100, years);
        
        document.getElementById('investment-summary').innerHTML = `
            <p><strong>Future Value:</strong> $${balance.toFixed(2)}</p>
            <p><strong>Inflation-Adjusted Value:</strong> $${inflationAdjusted.toFixed(2)}</p>
            <p><strong>Total Contributions:</strong> $${totalContributions.toFixed(2)}</p>
            <p><strong>Total Growth:</strong> $${(balance - totalContributions).toFixed(2)}</p>
        `;
        
        document.querySelector('#investment-table tbody').innerHTML = projectionHTML;
        document.getElementById('investment-results').style.display = 'block';
    }
}