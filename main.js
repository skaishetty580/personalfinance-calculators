class FinanceApp {
    constructor() {
        this.calculators = {
            mortgage: null,
            investment: null,
            debt: null,
            retirement: null,
            budget: null
        };
        this.currentCalculator = null;
        this.init();
    }

    init() {
        this.setupCalculatorSelector();
        this.loadCalculator('mortgage'); // Load default calculator
    }

    setupCalculatorSelector() {
        const selector = document.getElementById('calculator-select');
        selector.addEventListener('change', (e) => {
            this.loadCalculator(e.target.value);
        });
    }

    loadCalculator(calculatorType) {
        const container = document.querySelector('.calculator-container');
        container.innerHTML = ''; // Clear previous calculator
        
        if (!calculatorType) return;
        
        switch(calculatorType) {
            case 'mortgage':
                if (!this.calculators.mortgage) {
                    this.calculators.mortgage = new MortgageCalculator(container);
                } else {
                    container.innerHTML = '';
                    this.calculators.mortgage.container = container;
                    this.calculators.mortgage.renderForm();
                }
                this.currentCalculator = this.calculators.mortgage;
                break;
                
            case 'investment':
                if (!this.calculators.investment) {
                    this.calculators.investment = new InvestmentCalculator(container);
                } else {
                    container.innerHTML = '';
                    this.calculators.investment.container = container;
                    this.calculators.investment.renderForm();
                }
                this.currentCalculator = this.calculators.investment;
                break;
                
            case 'debt':
                if (!this.calculators.debt) {
                    this.calculators.debt = new DebtCalculator(container);
                } else {
                    container.innerHTML = '';
                    this.calculators.debt.container = container;
                    this.calculators.debt.renderForm();
                }
                this.currentCalculator = this.calculators.debt;
                break;
                
            case 'retirement':
                if (!this.calculators.retirement) {
                    this.calculators.retirement = new RetirementCalculator(container);
                } else {
                    container.innerHTML = '';
                    this.calculators.retirement.container = container;
                    this.calculators.retirement.renderForm();
                }
                this.currentCalculator = this.calculators.retirement;
                break;
                
            case 'budget':
                if (!this.calculators.budget) {
                    this.calculators.budget = new BudgetCalculator(container);
                } else {
                    container.innerHTML = '';
                    this.calculators.budget.container = container;
                    this.calculators.budget.renderForm();
                }
                this.currentCalculator = this.calculators.budget;
                break;
        }
        
        // Update selector to show current calculator
        document.getElementById('calculator-select').value = calculatorType;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinanceApp();
});