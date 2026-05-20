import { Transaction } from '../types';

interface CategoryStats {
  category: string;
  total: number;
  count: number;
  average: number;
}

export class AIService {
  
  static async analyzeSpending(transactions: Transaction[]): Promise<string[]> {
    const advice: string[] = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    
    if (expenses.length === 0) {
      advice.push('📊 Aún no tienes gastos registrados. ¡Empieza a trackear tus finanzas!');
      return advice;
    }
    
    // Calcular totales
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    // Regla 1: Análisis de balance
    if (balance < 0) {
      advice.push(`🔴 ¡ALERTA! Estás gastando ${Math.abs(balance).toFixed(2)}Bs más de lo que ingresas. Revisa tus gastos urgentemente.`);
    } else if (balance < totalIncome * 0.1) {
      advice.push(`⚠️ Tu ahorro es bajo (${balance.toFixed(2)}Bs). Intenta ahorrar al menos el 10% de tus ingresos.`);
    } else {
      advice.push(`✅ ¡Buen trabajo! Has ahorrado ${balance.toFixed(2)}Bs este período.`);
    }
    
    // Regla 2: Detectar categoría con mayor gasto
    const categoryStats = this.getCategoryStats(expenses);
    if (categoryStats.length > 0) {
      const topCategory = categoryStats.reduce((max, cat) => cat.total > max.total ? cat : max);
      const percentageOfTotal = (topCategory.total / totalExpenses) * 100;
      
      if (percentageOfTotal > 40) {
        advice.push(`🎯 El ${percentageOfTotal.toFixed(0)}% de tus gastos está en "${topCategory.category}". ¿Puedes reducir esta categoría?`);
      }
    }
    
    // Regla 3: Detectar gastos pequeños que suman mucho
    const smallExpenses = expenses.filter(e => e.amount < 20);
    if (smallExpenses.length > 10) {
      const smallTotal = smallExpenses.reduce((sum, e) => sum + e.amount, 0);
      advice.push(`💡 Tienes ${smallExpenses.length} gastos pequeños (<20Bs) que suman ${smallTotal.toFixed(2)}Bs. ¡Cada pequeño gasto cuenta!`);
    }
    
    // Regla 4: Recomendación inteligente personalizada
    if (totalExpenses > 0) {
      const savingTarget = totalExpenses * 0.1;
      advice.push(`🎯 Meta sugerida: Intenta reducir tus gastos en un 10% (${savingTarget.toFixed(2)}Bs) este mes.`);
    }
    
    return advice;
  }
  
  static async predictNextMonthExpenses(transactions: Transaction[]): Promise<number> {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length < 3) return 0;
    
    // Regresión lineal simple para predicción
    const sorted = expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const n = sorted.length;
    
    // Usar últimos 3 meses si hay datos
    const recent = sorted.slice(-Math.min(12, n));
    const avgExpense = recent.reduce((sum, t) => sum + t.amount, 0) / recent.length;
    
    // Pequeña inflación del 2% para predicción conservadora
    return avgExpense * 1.02;
  }
  
  private static getCategoryStats(expenses: Transaction[]): CategoryStats[] {
    const stats = new Map<string, { total: number; count: number }>();
    
    for (const expense of expenses) {
      const existing = stats.get(expense.category);
      if (existing) {
        existing.total += expense.amount;
        existing.count++;
      } else {
        stats.set(expense.category, { total: expense.amount, count: 1 });
      }
    }
    
    return Array.from(stats.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      average: data.total / data.count
    }));
  }
  
  static generateBudgetSuggestion(transactions: Transaction[]): Record<string, number> {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryStats = this.getCategoryStats(expenses);
    
    const suggestions: Record<string, number> = {};
    for (const stat of categoryStats) {
      // Sugerir reducir 5% en cada categoría si hay déficit
      suggestions[stat.category] = stat.total * 0.95;
    }
    
    return suggestions;
  }
}

export default AIService;