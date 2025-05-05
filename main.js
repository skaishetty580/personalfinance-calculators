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
        this.setupMobileMenu();
        this.setupCalculatorCards();
        this.setupFooterLinks();
        this.setupBackButton();
    }

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.querySelector('.main-nav');
        
        menuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuBtn.innerHTML = mainNav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    setupCalculatorCards() {
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the button specifically
                if (e.target.classList.contains('card-button')) return;
                
                const calculatorType = card.dataset.calculator;
                this.loadCalculator(calculatorType);
            });
        });
        
        document.querySelectorAll('.card-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const calculatorType = e.target.closest('.calculator-card').dataset.calculator;
                this.loadCalculator(calculatorType);
            });
        });
    }

    setupFooterLinks() {
        document.querySelectorAll('footer a[data-calculator]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const calculatorType = link.dataset.calculator;
                this.loadCalculator(calculatorType);
            });
        });
    }

    setupBackButton() {
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.showHomePage();
        });
    }

    loadCalculator(calculatorType) {
        // Hide all page sections
        document.querySelectorAll('section, .main-footer').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show calculator container
        const container = document.getElementById('calculator-container');
        const calculatorContent = document.querySelector('.calculator-content');
        container.style.display = 'block';
        
        // Set calculator title
        const titleMap = {
            mortgage: 'Mortgage Calculator',
            investment: 'Investment Calculator',
            debt: 'Debt Payoff Calculator',
            retirement: 'Retirement Planner',
            budget: 'Budget Analyzer'
        };
        document.getElementById('calculator-title').textContent = titleMap[calculatorType];
        
        // Clear previous calculator
        calculatorContent.innerHTML = '';
        
        // Load the selected calculator
        switch(calculatorType) {
            case 'mortgage':
                if (!this.calculators.mortgage) {
                    this.calculators.mortgage = new MortgageCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.mortgage.container = calculatorContent;
                    this.calculators.mortgage.renderForm();
                }
                this.currentCalculator = this.calculators.mortgage;
                break;
                
            case 'investment':
                if (!this.calculators.investment) {
                    this.calculators.investment = new InvestmentCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.investment.container = calculatorContent;
                    this.calculators.investment.renderForm();
                }
                this.currentCalculator = this.calculators.investment;
                break;
                
            case 'debt':
                if (!this.calculators.debt) {
                    this.calculators.debt = new DebtCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.debt.container = calculatorContent;
                    this.calculators.debt.renderForm();
                }
                this.currentCalculator = this.calculators.debt;
                break;
                
            case 'retirement':
                if (!this.calculators.retirement) {
                    this.calculators.retirement = new RetirementCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.retirement.container = calculatorContent;
                    this.calculators.retirement.renderForm();
                }
                this.currentCalculator = this.calculators.retirement;
                break;
                
            case 'budget':
                if (!this.calculators.budget) {
                    this.calculators.budget = new BudgetCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.budget.container = calculatorContent;
                    this.calculators.budget.renderForm();
                }
                this.currentCalculator = this.calculators.budget;
                break;
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    showHomePage() {
        // Hide calculator container
        document.getElementById('calculator-container').style.display = 'none';
        
        // Show all page sections
        document.querySelectorAll('section, .main-footer').forEach(el => {
            el.style.display = 'block';
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinanceApp();
});
