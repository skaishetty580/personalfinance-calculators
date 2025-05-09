class DebtCalculator {
    // ... (keep previous methods the same until calculate() method)

    async calculate() {
        // Get all debts
        this.debts = [];
        const debtEntries = document.querySelectorAll('.debt-entry');
        
        debtEntries.forEach((entry, index) => {
            const name = entry.querySelector('.debt-name').value || `Debt ${index + 1}`;
            const balance = parseFloat(entry.querySelector('.debt-balance').value) || 0;
            const rate = parseFloat(entry.querySelector('.debt-rate').value) || 0;
            const payment = parseFloat(entry.querySelector('.debt-payment').value) || 0;
            
            if (balance > 0 && payment > 0) {
                this.debts.push({
                    name,
                    balance,
                    rate,
                    payment,
                    remaining: balance,
                    interestPaid: 0
                });
            }
        });
        
        if (this.debts.length === 0) {
            alert('Please enter at least one valid debt');
            return;
        }
        
        // Show loading indicator
        const calculateBtn = document.getElementById('calculate-debt');
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        // Get payoff method and extra payment
        const method = document.getElementById('payoff-method').value;
        const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
        
        // Sort debts based on payoff method
        if (method === 'avalanche') {
            this.debts.sort((a, b) => b.rate - a.rate);
        } else { // snowball
            this.debts.sort((a, b) => a.balance - b.balance);
        }
        
        // Calculate payoff plan in chunks to avoid blocking
        try {
            const result = await this.calculatePayoffPlan(extraPayment);
            this.displayResults(result);
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred during calculation');
        } finally {
            // Restore calculate button
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Payoff Plan';
        }
    }

    calculatePayoffPlan(extraPayment) {
        return new Promise((resolve) => {
            // Use setTimeout to break up the calculation into chunks
            setTimeout(() => {
                const payoffPlan = [];
                let month = 0;
                let totalPaid = 0;
                let totalInterest = 0;
                let debtsRemaining = this.debts.length;
                const maxMonths = 1200; // 100 years as safety limit
                
                while (debtsRemaining > 0 && month < maxMonths) {
                    month++;
                    let availableExtra = extraPayment;
                    
                    // Make minimum payments on all debts
                    this.debts.forEach(debt => {
                        if (debt.remaining > 0) {
                            const interest = debt.remaining * (debt.rate / 100 / 12);
                            let principal = Math.min(debt.payment - interest, debt.remaining);
                            
                            debt.remaining -= principal;
                            debt.interestPaid += interest;
                            totalInterest += interest;
                            totalPaid += debt.payment;
                            
                            payoffPlan.push({
                                month,
                                debt: debt.name,
                                payment: debt.payment,
                                principal,
                                interest,
                                remaining: debt.remaining
                            });
                        }
                    });
                    
                    // Apply extra payments to first remaining debt in priority order
                    while (availableExtra > 0 && debtsRemaining > 0) {
                        const activeDebt = this.debts.find(debt => debt.remaining > 0);
                        
                        if (!activeDebt) break;
                        
                        const extra = Math.min(availableExtra, activeDebt.remaining);
                        activeDebt.remaining -= extra;
                        totalPaid += extra;
                        availableExtra -= extra;
                        
                        payoffPlan.push({
                            month,
                            debt: activeDebt.name,
                            payment: extra,
                            principal: extra,
                            interest: 0,
                            remaining: activeDebt.remaining
                        });
                        
                        if (activeDebt.remaining <= 0) {
                            debtsRemaining--;
                        }
                    }
                }
                
                // Calculate total debt
                const totalDebt = this.debts.reduce((sum, debt) => sum + debt.balance, 0);
                
                resolve({
                    payoffPlan,
                    totalDebt,
                    totalInterest,
                    totalPaid,
                    months: month
                });
            }, 0);
        });
    }

    displayResults({ payoffPlan, totalDebt, totalInterest, totalPaid, months }) {
        // Display results
        document.getElementById('total-debt').textContent = `$${totalDebt.toLocaleString('en-US')}`;
        document.getElementById('total-interest').textContent = `$${totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        document.getElementById('payoff-time').textContent = `${months} months (${(months/12).toFixed(1)} years)`;
        document.getElementById('total-paid').textContent = `$${totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        
        // Generate payoff plan table
        this.generatePayoffPlanTable(payoffPlan);
        
        // Generate chart
        this.generateChart(totalDebt, totalInterest);
        
        // Show results
        document.getElementById('debt-results').style.display = 'block';
    }

    // ... (keep the rest of the methods the same)
}
