class DebtCalculator {
    constructor(container) {
        this.container = container;
        this.debtCounter = 1;
        this.renderForm();
        this.setupEventListeners();
    }

    renderForm() {
        this.container.innerHTML = `
            <div id="debt-calculator" class="calculator">
                <h2>Debt Payoff Calculator</h2>
                <div id="debt-inputs">
                    <div class="debt-item">
                        <div class="input-group">
                            <label>Debt Name</label>
                            <input type="text" class="debt-name" placeholder="Credit Card">
                        </div>
                        <div class="input-group">
                            <label>Balance ($)</label>
                            <input type="number" class="debt-balance" placeholder="5,000">
                        </div>
                        <div class="input-group">
                            <label>Interest Rate (%)</label>
                            <input type="number" class="debt-rate" placeholder="18.99" step="0.01">
                        </div>
                        <div class="input-group">
                            <label>Minimum Payment ($)</label>
                            <input type="number" class="debt-min-payment" placeholder="100">
                        </div>
                    </div>
                </div>
                <button id="add-debt">Add Another Debt</button>
                <div class="input-group">
                    <label for="debt-payment">Monthly Payment Available ($)</label>
                    <input type="number" id="debt-payment" placeholder="500">
                </div>
                <div class="input-group">
                    <label for="debt-strategy">Payoff Strategy</label>
                    <select id="debt-strategy">
                        <option value="avalanche">Avalanche (Highest Interest First)</option>
                        <option value="snowball">Snowball (Smallest Balance First)</option>
                    </select>
                </div>
                <button id="calculate-debt">Calculate Payoff Plan</button>
                <div id="debt-results" class="results" style="display: none;">
                    <h3>Debt Payoff Plan</h3>
                    <div id="debt-summary"></div>
                    <table id="debt-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Debt</th>
                                <th>Payment</th>
                                <th>Interest</th>
                                <th>Principal</th>
                                <th>Remaining</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('add-debt').addEventListener('click', () => this.addDebt());
        document.getElementById('calculate-debt').addEventListener('click', () => this.calculate());
    }

    addDebt() {
        this.debtCounter++;
        const newDebt = document.createElement('div');
        newDebt.className = 'debt-item';
        newDebt.innerHTML = `
            <div class="input-group">
                <label>Debt Name</label>
                <input type="text" class="debt-name" placeholder="Debt ${this.debtCounter}">
            </div>
            <div class="input-group">
                <label>Balance ($)</label>
                <input type="number" class="debt-balance" placeholder="0">
            </div>
            <div class="input-group">
                <label>Interest Rate (%)</label>
                <input type="number" class="debt-rate" placeholder="0" step="0.01">
            </div>
            <div class="input-group">
                <label>Minimum Payment ($)</label>
                <input type="number" class="debt-min-payment" placeholder="0">
            </div>
        `;
        document.getElementById('debt-inputs').appendChild(newDebt);
    }

    calculate() {
        const debtItems = document.querySelectorAll('.debt-item');
        const debts = [];
        
        debtItems.forEach(item => {
            const name = item.querySelector('.debt-name').value || `Debt ${debts.length + 1}`;
            const balance = parseFloat(item.querySelector('.debt-balance').value) || 0;
            const rate = parseFloat(item.querySelector('.debt-rate').value) || 0;
            const minPayment = parseFloat(item.querySelector('.debt-min-payment').value) || 0;
            
            if (balance > 0) {
                debts.push({
                    name,
                    balance,
                    interestRate: rate,
                    minimumPayment: minPayment
                });
            }
        });
        
        const monthlyPayment = parseFloat(document.getElementById('debt-payment').value) || 0;
        const strategy = document.getElementById('debt-strategy').value;
        
        if (debts.length === 0 || monthlyPayment === 0) {
            alert('Please enter at least one debt and a monthly payment amount');
            return;
        }
        
        let remainingPayment = monthlyPayment;
        let months = 0;
        let totalInterest = 0;
        let payoffHTML = '';
        
        if (strategy === 'avalanche') {
            debts.sort((a, b) => b.interestRate - a.interestRate);
        } else {
            debts.sort((a, b) => a.balance - b.balance);
        }
        
        const workingDebts = debts.map(debt => ({
            ...debt,
            remaining: debt.balance,
            paid: false
        }));
        
        while (workingDebts.some(debt => !debt.paid) && months < 600) {
            months++;
            let monthInterest = 0;
            
            for (const debt of workingDebts) {
                if (debt.paid || remainingPayment <= 0) continue;
                
                const interest = debt.remaining * (debt.interestRate / 100 / 12);
                const payment = Math.min(debt.minimumPayment, debt.remaining + interest);
                const principal = payment - interest;
                
                debt.remaining -= principal;
                monthInterest += interest;
                remainingPayment -= payment;
                
                if (debt.remaining <= 0) {
                    debt.paid = true;
                }
            }
            
            const activeDebt = workingDebts.find(debt => !debt.paid);
            if (activeDebt && remainingPayment > 0) {
                const interest = activeDebt.remaining * (activeDebt.interestRate / 100 / 12);
                const principal = Math.min(remainingPayment - interest, activeDebt.remaining);
                
                activeDebt.remaining -= principal;
                monthInterest += interest;
                remainingPayment -= (principal + interest);
                
                if (activeDebt.remaining <= 0) {
                    activeDebt.paid = true;
                }
            }
            
            totalInterest += monthInterest;
            remainingPayment = monthlyPayment;
            
            if (months % 6 === 0 || months === 1 || workingDebts.every(debt => debt.paid)) {
                const paidDebts = workingDebts.filter(debt => debt.paid).length;
                payoffHTML += `
                    <tr>
                        <td>${months}</td>
                        <td>${paidDebts}/${debts.length} paid</td>
                        <td>$${monthlyPayment.toFixed(2)}</td>
                        <td>$${monthInterest.toFixed(2)}</td>
                        <td>$${(monthlyPayment - monthInterest).toFixed(2)}</td>
                        <td>$${workingDebts.reduce((sum, debt) => sum + debt.remaining, 0).toFixed(2)}</td>
                    </tr>
                `;
            }
            
            if (workingDebts.every(debt => debt.paid)) break;
        }
        
        document.getElementById('debt-summary').innerHTML = `
            <p><strong>Total Months to Payoff:</strong> ${months}</p>
            <p><strong>Total Interest Paid:</strong> $${totalInterest.toFixed(2)}</p>
            <p><strong>Strategy Used:</strong> ${strategy === 'avalanche' ? 'Avalanche (Highest Interest First)' : 'Snowball (Smallest Balance First)'}</p>
        `;
        
        document.querySelector('#debt-table tbody').innerHTML = payoffHTML;
        document.getElementById('debt-results').style.display = 'block';
    }
}