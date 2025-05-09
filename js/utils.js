// Utility functions for financial calculations
class FinanceUtils {
    static formatCurrency(amount, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount);
    }

    static calculateCompoundInterest(principal, rate, years, compoundFrequency = 12, monthlyContribution = 0) {
        const periodicRate = rate / 100 / compoundFrequency;
        const periods = years * compoundFrequency;
        let balance = principal;
        
        for (let i = 0; i < periods; i++) {
            balance += monthlyContribution;
            balance *= (1 + periodicRate);
        }
        
        return balance;
    }

    static calculateMonthlyPayment(principal, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const payments = years * 12;
        return principal * monthlyRate * 
            Math.pow(1 + monthlyRate, payments) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
    }

    static calculateAmortizationSchedule(principal, rate, years) {
        const monthlyPayment = this.calculateMonthlyPayment(principal, rate, years);
        const monthlyRate = rate / 100 / 12;
        const payments = years * 12;
        let balance = principal;
        const schedule = [];
        
        for (let i = 1; i <= payments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;
            
            if (balance < 0) balance = 0;
            
            schedule.push({
                month: i,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                balance
            });
        }
        
        return schedule;
    }
}

// DOM utility functions
class DOMUtils {
    static showElement(id) {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    }

    static hideElement(id) {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    }

    static toggleElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }
}
