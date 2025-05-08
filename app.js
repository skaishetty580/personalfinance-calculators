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
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => console.log('Chart.js loaded');
        document.head.appendChild(script);
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
        
        // Set calculator title
        const titleMap = {
            mortgage: 'Mortgage Calculator',
            investment: 'Investment Calculator',
            debt: 'Debt Payoff Calculator',
            retirement: 'Retirement Planner',
            budget: 'Budget Analyzer',
            tax: 'Tax Calculator'
        };
        document.getElementById('calculator-title').textContent = titleMap[calculatorType];
        
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
                
            // Add cases for other calculators here
                
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