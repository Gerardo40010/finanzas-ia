import { Request, Response } from 'express';
import { getDatabase } from '../database/sqliteClient';
import AIService from '../services/aiService';
import { Transaction } from '../types';

export class AIController {
  
  static async getAdvice(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const transactions: Transaction[] = await db.all('SELECT * FROM transactions');
      
      const advice = await AIService.analyzeSpending(transactions);
      const prediction = await AIService.predictNextMonthExpenses(transactions);
      const budgetSuggestions = AIService.generateBudgetSuggestion(transactions);
      
      // Calcular métricas
      const expenses = transactions.filter(t => t.type === 'expense');
      const incomes = transactions.filter(t => t.type === 'income');
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
      
      // Detectar categoría principal
      const categoryMap = new Map<string, number>();
      for (const exp of expenses) {
        categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount);
      }
      let topCategory = 'ninguna';
      let maxAmount = 0;
      for (const [cat, amount] of categoryMap) {
        if (amount > maxAmount) {
          maxAmount = amount;
          topCategory = cat;
        }
      }
      
      res.json({
        success: true,
        data: {
          advice,
          prediction: prediction.toFixed(2),
          budgetSuggestions,
          metrics: {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            topCategory,
            transactionCount: transactions.length
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting AI advice:', error);
      res.status(500).json({ success: false, error: 'Error al generar recomendaciones IA' });
    }
  }
  
  static async getSpendingPrediction(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const transactions: Transaction[] = await db.all('SELECT * FROM transactions WHERE type = "expense"');
      
      const prediction = await AIService.predictNextMonthExpenses(transactions);
      
      res.json({
        success: true,
        data: {
          predictedExpenses: prediction,
          confidence: transactions.length > 10 ? 'Alta' : 'Media-Baja',
          basedOnTransactions: transactions.length
        }
      });
    } catch (error) {
      console.error('Error getting prediction:', error);
      res.status(500).json({ success: false, error: 'Error al obtener predicción' });
    }
  }
}