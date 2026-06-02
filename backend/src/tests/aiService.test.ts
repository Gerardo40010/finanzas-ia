import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import AIService from '../services/aiService';
import type { Transaction } from '../types';

describe('AIService - Pruebas de integración', () => {
  
  describe('analyzeSpending', () => {
    
    it('debe devolver un arreglo de recomendaciones', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', description: 'Compra', amount: 500, type: 'expense', category: 'alimentacion', date: '2024-01-01' },
        { id: '2', description: 'Sueldo', amount: 5000, type: 'income', category: 'salario', date: '2024-01-01' },
      ];
      const recommendations = await AIService.analyzeSpending(mockTransactions);
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('debe detectar cuando no hay gastos', async () => {
      const emptyTransactions: Transaction[] = [];
      const recommendations = await AIService.analyzeSpending(emptyTransactions);
      expect(recommendations[0]).toContain('Aún no tienes gastos registrados');
    });

    it('debe incluir recomendación de balance positivo', async () => {
      const positiveBalanceTransactions: Transaction[] = [
        { id: 't1', description: 'Ingreso', amount: 5000, type: 'income', category: 'salario', date: '2024-01-01' },
        { id: 't2', description: 'Gasto', amount: 1000, type: 'expense', category: 'alimentacion', date: '2024-01-02' }
      ];
      const recommendations = await AIService.analyzeSpending(positiveBalanceTransactions);
      expect(recommendations.some(rec => rec.includes('Buen trabajo'))).toBe(true);
    });

    it('debe incluir recomendación de balance negativo', async () => {
      const negativeBalanceTransactions: Transaction[] = [
        { id: 't1', description: 'Ingreso', amount: 1000, type: 'income', category: 'salario', date: '2024-01-01' },
        { id: 't2', description: 'Gasto', amount: 5000, type: 'expense', category: 'alimentacion', date: '2024-01-02' }
      ];
      const recommendations = await AIService.analyzeSpending(negativeBalanceTransactions);
      expect(recommendations.some(rec => rec.includes('ALERTA'))).toBe(true);
    });

    it('debe detectar categoría con gasto excesivo (>40%)', async () => {
      const highCategoryTransactions: Transaction[] = [
        { id: 't1', description: 'Sueldo', amount: 5000, type: 'income', category: 'salario', date: '2024-01-01' },
        { id: 't2', description: 'Alimentacion 1', amount: 2000, type: 'expense', category: 'alimentacion', date: '2024-01-02' },
        { id: 't3', description: 'Alimentacion 2', amount: 1000, type: 'expense', category: 'alimentacion', date: '2024-01-03' },
        { id: 't4', description: 'Transporte', amount: 500, type: 'expense', category: 'transporte', date: '2024-01-04' }
      ];
      const recommendations = await AIService.analyzeSpending(highCategoryTransactions);
      expect(recommendations.some(rec => rec.includes('alimentacion'))).toBe(true);
    });
  });

  describe('predictNextMonthExpenses', () => {
    
    it('debe devolver un número mayor a 0 cuando hay datos suficientes', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', description: 'Gasto 1', amount: 100, type: 'expense', category: 'alimentacion', date: '2024-01-01' },
        { id: '2', description: 'Gasto 2', amount: 200, type: 'expense', category: 'transporte', date: '2024-01-02' },
        { id: '3', description: 'Gasto 3', amount: 150, type: 'expense', category: 'ocio', date: '2024-01-03' },
      ];
      const prediction = await AIService.predictNextMonthExpenses(mockTransactions);
      expect(typeof prediction).toBe('number');
      expect(prediction).toBeGreaterThan(0);
    });

    it('debe devolver 0 cuando hay menos de 3 gastos', async () => {
      const fewExpenses: Transaction[] = [
        { id: 't1', description: 'Gasto', amount: 100, type: 'expense', category: 'alimentacion', date: '2024-01-01' }
      ];
      const prediction = await AIService.predictNextMonthExpenses(fewExpenses);
      expect(prediction).toBe(0);
    });
  });

  describe('generateBudgetSuggestion', () => {
    
    it('debe devolver sugerencias de presupuesto por categoría', () => {
      const mockTransactions: Transaction[] = [
        { id: '1', description: 'Alimentacion', amount: 500, type: 'expense', category: 'alimentacion', date: '2024-01-01' },
        { id: '2', description: 'Transporte', amount: 300, type: 'expense', category: 'transporte', date: '2024-01-02' },
        { id: '3', description: 'Sueldo', amount: 5000, type: 'income', category: 'salario', date: '2024-01-01' },
      ];
      const suggestions = AIService.generateBudgetSuggestion(mockTransactions);
      expect(typeof suggestions).toBe('object');
      expect(Object.keys(suggestions).length).toBeGreaterThan(0);
    });

    it('cada sugerencia debe ser menor al gasto original', () => {
      const mockTransactions: Transaction[] = [
        { id: '1', description: 'Alimentacion', amount: 1000, type: 'expense', category: 'alimentacion', date: '2024-01-01' },
        { id: '2', description: 'Sueldo', amount: 5000, type: 'income', category: 'salario', date: '2024-01-01' },
      ];
      const suggestions = AIService.generateBudgetSuggestion(mockTransactions);
      const alimentacionSuggestion = suggestions['alimentacion'];
      if (alimentacionSuggestion) {
        expect(alimentacionSuggestion).toBeLessThan(1000);
        expect(alimentacionSuggestion).toBe(950); // 5% menos
      }
    });
  });
});