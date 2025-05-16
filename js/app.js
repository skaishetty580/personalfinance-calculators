class FinanceApp {
    constructor() {
        this.calculators = {
            mortgage: null,
            investment: null,
            debt: null,
            retirement: null,
            budget: null,
            tax: null
        };
        this.currentCalculator = null;
        this.init();
    }

    init() {
        this.setupCalculatorCards();
        this.setupBackButton();
        this.loadChartJS();
    }

    loadChartJS() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => console.log('Chart.js loaded');
            document.head.appendChild(script);
        }
    }

    setupCalculatorCards() {
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('click', (e) => {
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

    setupBackButton() {
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.showHomePage();
        });
    }

    loadCalculator(calculatorType) {
        // Hide all page sections
        document.querySelectorAll('section').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show calculator container
        const container = document.getElementById('calculator-container');
        const calculatorContent = document.querySelector('.calculator-content');
        container.style.display = 'block';
        
      // Set calculator title and icon
   // Set calculator title with icon
// Set calculator title and icon
const calculatorInfo = {
    mortgage: { title: 'Mortgage Calculator', icon: 'fa-home' },
    investment: { title: 'Investment Calculator', icon: 'fa-chart-line' },
    debt: { title: 'Debt Payoff Calculator', icon: 'fa-credit-card' },
    retirement: { title: 'Retirement Planner', icon: 'fa-umbrella-beach' },
    budget: { title: 'Budget Analyzer', icon: 'fa-wallet' },
    tax: { title: 'Tax Calculator', icon: 'fa-file-invoice-dollar' }
};

const calculatorIcon = document.getElementById('calculator-icon');
const calculatorTitle = document.getElementById('calculator-title');

calculatorIcon.className = `fas ${calculatorInfo[calculatorType].icon}`;
calculatorTitle.textContent = calculatorInfo[calculatorType].title;
calculatorIcon.style.color = '#4361ee'; // Force color change    
  // Update <title> tag dynamically for SEO
document.title = `${calculatorInfo[calculatorType].title} | [Your Website Name]`;

// Update <meta name="description"> dynamically for SEO
let metaDesc = document.querySelector('meta[name="description"]');
if (metaDesc) {
    // Update if already exists
    switch (calculatorType) {
        case 'mortgage':
            metaDesc.setAttribute('content', 'Calculate your mortgage payments instantly with our free mortgage calculator. Easy, fast, and secure tool.');
            break;
        case 'investment':
            metaDesc.setAttribute('content', 'Estimate your investment growth over time using our free investment calculator. Simple, fast, and secure.');
            break;
        case 'debt':
            metaDesc.setAttribute('content', 'Plan your debt payoff journey easily using our free debt payoff calculator. Snowball and avalanche methods available.');
            break;
        case 'retirement':
            metaDesc.setAttribute('content', 'Plan your retirement savings goals with our free retirement planner calculator. Easy, fast, and secure.');
            break;
        case 'budget':
            metaDesc.setAttribute('content', 'Analyze your monthly or annual budget with our free budget analyzer tool.');
            break;
        case 'tax':
            metaDesc.setAttribute('content', 'Estimate your taxes easily with our free tax calculator. Fast and secure online tool.');
            break;
        default:
            metaDesc.setAttribute('content', 'Use our free financial calculators. No sign-up. Fast, easy, secure.');
    }
} else {
    // If not found, create one
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    metaDesc.content = "Use our free financial calculators. No sign-up. Fast, easy, secure.";
    document.head.appendChild(metaDesc);
}
      
        // Clear previous calculator
        calculatorContent.innerHTML = '';
        
        // Load the appropriate calculator
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
                
            case 'tax':
                if (!this.calculators.tax) {
                    this.calculators.tax = new TaxCalculator(calculatorContent);
                } else {
                    calculatorContent.innerHTML = '';
                    this.calculators.tax.container = calculatorContent;
                    this.calculators.tax.renderForm();
                }
                this.currentCalculator = this.calculators.tax;
                break;
                
            default:
                calculatorContent.innerHTML = `
                    <div style="text-align: center; padding: 40px 0;">
                        <i class="fas fa-cogs" style="font-size: 50px; color: var(--gray-color); margin-bottom: 20px;"></i>
                        <h3>Calculator Coming Soon</h3>
                        <p>This calculator is not yet implemented in this demo.</p>
                        <button class="button back-button" style="margin-top: 20px;">
                            <i class="fas fa-arrow-left"></i> Back to Home
                        </button>
                    </div>
                `;
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }


    showHomePage() {
        // Hide calculator container
        document.getElementById('calculator-container').style.display = 'none';
        
        // Show all page sections
        document.querySelectorAll('section').forEach(el => {
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
