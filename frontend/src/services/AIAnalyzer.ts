import { Transaction } from '../types';
import { IAnalysisStrategy } from '../strategies/IAnalysisStrategy';

/**
 * PATRÓN STRATEGY - Contexto
 * 
 * AIAnalyzer mantiene una lista de estrategias y las ejecuta sobre las transacciones.
 * Permite agregar, quitar o cambiar estrategias sin modificar el código existente.
 */
export class AIAnalyzer {
  private strategies: IAnalysisStrategy[] = [];

  constructor() {
    this.strategies = [];
  }

  // Agregar una estrategia
  addStrategy(strategy: IAnalysisStrategy): void {
    this.strategies.push(strategy);
  }

  // Eliminar una estrategia
  removeStrategy(strategyName: string): void {
    this.strategies = this.strategies.filter(s => s.getName() !== strategyName);
  }

  // Ejecutar todas las estrategias y recolectar resultados
  analyze(transactions: Transaction[]): string[] {
    const results: string[] = [];
    
    if (transactions.length === 0) {
      return ['📊 Aún no tienes transacciones registradas. ¡Comienza a trackear tus finanzas!'];
    }
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
    // Contexto compartido para las estrategias
    const context = {
      expenses,
      incomes,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses
    };
    
    for (const strategy of this.strategies) {
      const result = strategy.analyze(transactions, context);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  // Obtener lista de estrategias activas
  getActiveStrategies(): string[] {
    return this.strategies.map(s => s.getName());
  }
}