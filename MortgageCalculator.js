class MortgageCalculator {
    constructor(container) {
        this.container = container;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div id="mortgage-calculator" class="calculator active">
                <h2>Mortgage Calculator</h2>
                <div class="input-group">
                    <label for="mortgage-amount">Loan Amount ($)</label>
                    <input type="number" id="mortgage-amount" placeholder="300,000">
                </div>
                <div class="input-group">
                    <label for="interest-rate">Interest Rate (%)</label>
                    <input type="number" id="interest-rate" placeholder="3.5" step="0.01">
                </div>
                <div class="input-group">
                    <label for="loan-term">Loan Term (years)</label>
                    <input type="number" id="loan-term" placeholder="30">
                </div>
                <div class="input-group">
                    <label for="property-tax">Annual Property Tax ($)</label>
                    <input type="number" id="property-tax" placeholder="3,600">
                </div>
                <div class="input-group">
                    <label for="insurance">Annual Home Insurance ($)</label>
                    <input type="number" id="insurance" placeholder="1,200">
                </div>
                <button id="calculate-mortgage">Calculate</button>
                <div id="mortgage-results" class="results" style="display: none;">
                    <h3>Mortgage Results</h3>
                    <div id="mortgage-summary"></div>
                    <table id="amortization-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Payment</th>
                                <th>Principal</th>
                                <th>Interest</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('calculate-mortgage').addEventListener('click', () => this.calculate());
    }

    calculate() {
        const amount = parseFloat(document.getElementById('mortgage-amount').value) || 300000;
        const rate = parseFloat(document.getElementById('interest-rate').value) || 3.5;
        const term = parseInt(document.getElementById('loan-term').value) || 30;
        const tax = parseFloat(document.getElementById('property-tax').value) || 3600;
        const insurance = parseFloat(document.getElementById('insurance').value) || 1200;
        
        const monthlyRate = rate / 100 / 12;
        const payments = term * 12;
        const monthlyPayment = amount * monthlyRate * 
            Math.pow(1 + monthlyRate, payments) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
        const totalPayment = monthlyPayment + (tax / 12) + (insurance / 12);
        const totalInterest = (monthlyPayment * payments) - amount;
        
        document.getElementById('mortgage-summary').innerHTML = `
            <p><strong>Monthly Payment:</strong> $${totalPayment.toFixed(2)}</p>
            <p><strong>Principal & Interest:</strong> $${monthlyPayment.toFixed(2)}</p>
            <p><strong>Taxes & Insurance:</strong> $${((tax + insurance)/12).toFixed(2)}</p>
            <p><strong>Total Interest:</strong> $${totalInterest.toFixed(2)}</p>
            <p><strong>Total Cost:</strong> $${(amount + totalInterest + tax * term + insurance * term).toFixed(2)}</p>
        `;
        
        let balance = amount;
        let amortizationHTML = '';
        for (let i = 1; i <= payments; i++) {
            const interest = balance * monthlyRate;
            const principal = monthlyPayment - interest;
            balance -= principal;
            
            if (i <= 5 || i % 12 === 0 || i === payments) {
                amortizationHTML += `
                    <tr>
                        <td>${i}</td>
                        <td>$${monthlyPayment.toFixed(2)}</td>
                        <td>$${principal.toFixed(2)}</td>
                        <td>$${interest.toFixed(2)}</td>
                        <td>$${Math.max(0, balance).toFixed(2)}</td>
                    </tr>
                `;
            }
        }
        
        document.querySelector('#amortization-table tbody').innerHTML = amortizationHTML;
        document.getElementById('mortgage-results').style.display = 'block';
    }
}