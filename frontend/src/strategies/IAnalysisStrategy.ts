import { Transaction } from '../types';

/**
 * PATRÓN STRATEGY
 * 
 * Contexto: AIService - Usa diferentes estrategias para analizar gastos
 * Estrategias: BalanceStrategy, CategoryStrategy, SmallExpensesStrategy, PredictionStrategy
 * 
 * Permite intercambiar algoritmos de análisis sin modificar el contexto.
 */

export interface IAnalysisStrategy {
  getName(): string;
  analyze(transactions: Transaction[], context?: any): string | null;
}

// Estrategia 1: Análisis de balance
export class BalanceStrategy implements IAnalysisStrategy {
  getName(): string {
    return 'balance';
  }

  analyze(transactions: Transaction[], context?: { totalIncome: number; totalExpenses: number }): string | null {
    if (!context) return null;
    
    const { totalIncome, totalExpenses } = context;
    const balance = totalIncome - totalExpenses;
    
    if (balance < 0) {
      return `🔴 ¡ALERTA! Estás gastando ${Math.abs(balance).toFixed(2)} Bs más de lo que ingresas. Revisa tus gastos urgentemente.`;
    } else if (balance < totalIncome * 0.1 && totalIncome > 0) {
      return `⚠️ Tu ahorro es bajo (${balance.toFixed(2)} Bs). Intenta ahorrar al menos el 10% de tus ingresos.`;
    } else if (balance > 0) {
      return `✅ ¡Buen trabajo! Has ahorrado ${balance.toFixed(2)} Bs este período.`;
    }
    return null;
  }
}

// Estrategia 2: Análisis de categoría con mayor gasto
export class CategoryStrategy implements IAnalysisStrategy {
  getName(): string {
    return 'topCategory';
  }

  analyze(transactions: Transaction[], context?: { expenses: Transaction[]; totalExpenses: number }): string | null {
    if (!context) return null;
    
    const { expenses, totalExpenses } = context;
    if (expenses.length === 0 || totalExpenses === 0) return null;
    
    // Calcular categoría con mayor gasto
    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount);
    }
    
    let topCategory = '';
    let topAmount = 0;
    for (const [category, amount] of categoryMap) {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    }
    
    const percentageOfTotal = (topAmount / totalExpenses) * 100;
    if (percentageOfTotal > 40) {
      return `🎯 El ${percentageOfTotal.toFixed(0)}% de tus gastos está en "${topCategory}". ¿Puedes reducir esta categoría?`;
    }
    return null;
  }
}

// Estrategia 3: Análisis de gastos pequeños
export class SmallExpensesStrategy implements IAnalysisStrategy {
  getName(): string {
    return 'smallExpenses';
  }

  analyze(transactions: Transaction[], context?: { expenses: Transaction[] }): string | null {
    if (!context) return null;
    
    const { expenses } = context;
    const smallExpenses = expenses.filter(expense => expense.amount < 20);
    
    if (smallExpenses.length > 10) {
      const smallTotal = smallExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return `💡 Tienes ${smallExpenses.length} gastos pequeños (<20 Bs) que suman ${smallTotal.toFixed(2)} Bs. ¡Cada pequeño gasto cuenta!`;
    }
    return null;
  }
}

// Estrategia 4: Predicción de gastos futuros
export class PredictionStrategy implements IAnalysisStrategy {
  getName(): string {
    return 'prediction';
  }

  analyze(transactions: Transaction[], context?: { expenses: Transaction[] }): string | null {
    if (!context) return null;
    
    const { expenses } = context;
    if (expenses.length < 3) return null;
    
    const recent = expenses.slice(-12);
    const average = recent.reduce((sum, exp) => sum + exp.amount, 0) / recent.length;
    const predicted = average * 1.02; // +2% inflación
    
    return `📈 Predicción: Se espera que gastes aproximadamente ${predicted.toFixed(2)} Bs el próximo mes.`;
  }
}

// Estrategia 5: Sugerencia de meta de ahorro
export class SavingGoalStrategy implements IAnalysisStrategy {
  getName(): string {
    return 'savingGoal';
  }

  analyze(transactions: Transaction[], context?: { totalExpenses: number }): string | null {
    if (!context) return null;
    
    const { totalExpenses } = context;
    if (totalExpenses > 0) {
      const savingTarget = totalExpenses * 0.1;
      return `🎯 Meta sugerida: Intenta reducir tus gastos en un 10% (${savingTarget.toFixed(2)} Bs) este mes.`;
    }
    return null;
  }
}