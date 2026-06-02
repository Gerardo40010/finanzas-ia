import { Transaction } from '../types';

interface CategoryStatistics {
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}

export class AIService {
  
  static async analyzeSpending(allTransactions: Transaction[]): Promise<string[]> {
    const recommendationsList: string[] = [];
    const expenseTransactions = allTransactions.filter(singleTransaction => singleTransaction.type === 'expense');
    const incomeTransactions = allTransactions.filter(singleTransaction => singleTransaction.type === 'income');
    
    if (expenseTransactions.length === 0) {
      recommendationsList.push('📊 Aún no tienes gastos registrados. ¡Empieza a trackear tus finanzas!');
      return recommendationsList;
    }
    
    // Calcular totales
    const totalExpensesAmount = expenseTransactions.reduce((accumulatedSum, singleTransaction) => accumulatedSum + singleTransaction.amount, 0);
    const totalIncomeAmount = incomeTransactions.reduce((accumulatedSum, singleTransaction) => accumulatedSum + singleTransaction.amount, 0);
    const currentBalance = totalIncomeAmount - totalExpensesAmount;
    
    // Regla 1: Análisis de balance
    if (currentBalance < 0) {
      recommendationsList.push(`🔴 ¡ALERTA! Estás gastando ${Math.abs(currentBalance).toFixed(2)} Bs más de lo que ingresas. Revisa tus gastos urgentemente.`);
    } else if (currentBalance < totalIncomeAmount * 0.1) {
      recommendationsList.push(`⚠️ Tu ahorro es bajo (${currentBalance.toFixed(2)} Bs). Intenta ahorrar al menos el 10% de tus ingresos.`);
    } else {
      recommendationsList.push(`✅ ¡Buen trabajo! Has ahorrado ${currentBalance.toFixed(2)} Bs este período.`);
    }
    
    // Regla 2: Detectar categoría con mayor gasto
    const categoryStatistics = this.calculateCategoryStatistics(expenseTransactions);
    if (categoryStatistics.length > 0) {
      const topCategory = categoryStatistics.reduce((maximumCategory, currentCategory) => 
        currentCategory.totalAmount > maximumCategory.totalAmount ? currentCategory : maximumCategory
      );
      const percentageOfTotalExpenses = (topCategory.totalAmount / totalExpensesAmount) * 100;
      
      if (percentageOfTotalExpenses > 40) {
        recommendationsList.push(`🎯 El ${percentageOfTotalExpenses.toFixed(0)}% de tus gastos está en "${topCategory.categoryName}". ¿Puedes reducir esta categoría?`);
      }
    }
    
    // Regla 3: Detectar gastos pequeños que suman mucho
    const smallExpenseTransactions = expenseTransactions.filter(singleExpense => singleExpense.amount < 20);
    if (smallExpenseTransactions.length > 10) {
      const smallExpensesTotalAmount = smallExpenseTransactions.reduce((accumulatedSum, singleExpense) => accumulatedSum + singleExpense.amount, 0);
      recommendationsList.push(`💡 Tienes ${smallExpenseTransactions.length} gastos pequeños (<20 Bs) que suman ${smallExpensesTotalAmount.toFixed(2)} Bs. ¡Cada pequeño gasto cuenta!`);
    }
    
    // Regla 4: Recomendación inteligente personalizada
    if (totalExpensesAmount > 0) {
      const suggestedSavingTarget = totalExpensesAmount * 0.1;
      recommendationsList.push(`🎯 Meta sugerida: Intenta reducir tus gastos en un 10% (${suggestedSavingTarget.toFixed(2)} Bs) este mes.`);
    }
    
    return recommendationsList;
  }
  
  static async predictNextMonthExpenses(allTransactions: Transaction[]): Promise<number> {
    const expenseTransactions = allTransactions.filter(singleTransaction => singleTransaction.type === 'expense');
    if (expenseTransactions.length < 3) return 0;
    
    // Ordenar por fecha
    const sortedTransactions = [...expenseTransactions].sort((firstTransaction, secondTransaction) => 
      new Date(firstTransaction.date).getTime() - new Date(secondTransaction.date).getTime()
    );
    
    // Usar últimos 12 gastos o todos si hay menos
    const recentTransactions = sortedTransactions.slice(-Math.min(12, sortedTransactions.length));
    const averageExpenseAmount = recentTransactions.reduce((accumulatedSum, singleTransaction) => 
      accumulatedSum + singleTransaction.amount, 0) / recentTransactions.length;
    
    // Pequeña inflación del 2% para predicción conservadora
    return averageExpenseAmount * 1.02;
  }
  
  private static calculateCategoryStatistics(expenseTransactions: Transaction[]): CategoryStatistics[] {
    const statisticsMap = new Map<string, { totalAmount: number; transactionCount: number }>();
    
    for (const singleExpense of expenseTransactions) {
      const existingStats = statisticsMap.get(singleExpense.category);
      if (existingStats) {
        existingStats.totalAmount += singleExpense.amount;
        existingStats.transactionCount++;
      } else {
        statisticsMap.set(singleExpense.category, { 
          totalAmount: singleExpense.amount, 
          transactionCount: 1 
        });
      }
    }
    
    const statisticsList: CategoryStatistics[] = [];
    for (const [categoryName, statisticsData] of statisticsMap) {
      statisticsList.push({
        categoryName,
        totalAmount: statisticsData.totalAmount,
        transactionCount: statisticsData.transactionCount,
        averageAmount: statisticsData.totalAmount / statisticsData.transactionCount
      });
    }
    
    return statisticsList;
  }
  
  static generateBudgetSuggestion(allTransactions: Transaction[]): Record<string, number> {
    const expenseTransactions = allTransactions.filter(singleTransaction => singleTransaction.type === 'expense');
    const categoryStatistics = this.calculateCategoryStatistics(expenseTransactions);
    
    const budgetSuggestions: Record<string, number> = {};
    for (const categoryStat of categoryStatistics) {
      // Sugerir reducir 5% en cada categoría como meta de ahorro
      budgetSuggestions[categoryStat.categoryName] = categoryStat.totalAmount * 0.95;
    }
    
    return budgetSuggestions;
  }
}

export default AIService;