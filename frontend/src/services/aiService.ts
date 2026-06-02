import { Transaction } from '../types';
import { AIAnalyzer } from './AIAnalyzer';
import { 
  BalanceStrategy, 
  CategoryStrategy, 
  SmallExpensesStrategy, 
  PredictionStrategy, 
  SavingGoalStrategy 
} from '../strategies/IAnalysisStrategy';

/**
 * AIService - Fachada para el análisis de gastos con IA
 * Utiliza el patrón Strategy internamente
 */
export class AIService {
  private static analyzer: AIAnalyzer | null = null;

  private static getAnalyzer(): AIAnalyzer {
    if (!AIService.analyzer) {
      AIService.analyzer = new AIAnalyzer();
      // Registrar todas las estrategias disponibles
      AIService.analyzer.addStrategy(new BalanceStrategy());
      AIService.analyzer.addStrategy(new CategoryStrategy());
      AIService.analyzer.addStrategy(new SmallExpensesStrategy());
      AIService.analyzer.addStrategy(new SavingGoalStrategy());
    }
    return AIService.analyzer;
  }

  static async analyzeSpending(transactions: Transaction[]): Promise<string[]> {
    const analyzer = AIService.getAnalyzer();
    return analyzer.analyze(transactions);
  }

  static async predictNextMonthExpenses(transactions: Transaction[]): Promise<number> {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length < 3) return 0;
    
    const recent = expenses.slice(-12);
    const average = recent.reduce((sum, t) => sum + t.amount, 0) / recent.length;
    return average * 1.02;
  }

  static generateBudgetSuggestion(transactions: Transaction[]): Record<string, number> {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();
    
    for (const expense of expenses) {
      categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount);
    }
    
    const suggestions: Record<string, number> = {};
    for (const [category, amount] of categoryMap) {
      suggestions[category] = amount * 0.95; // Reducir 5%
    }
    
    return suggestions;
  }
}

export default AIService;