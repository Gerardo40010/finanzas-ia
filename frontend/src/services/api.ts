import axios from 'axios';
import type { Transaction, CreateTransactionDTO, TransactionSummary, AIAdvice } from '../types';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data.data;
  },

  create: async (data: CreateTransactionDTO): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getSummary: async (): Promise<TransactionSummary> => {
    const response = await api.get('/transactions/summary');
    return response.data.data;
  },
};

export const aiService = {
  getAdvice: async (): Promise<AIAdvice> => {
    const response = await api.get('/ai/advice');
    return response.data.data;
  },
  
  getPrediction: async (): Promise<{ predictedExpenses: number; confidence: string }> => {
    const response = await api.get('/ai/prediction');
    return response.data.data;
  },
};

export default api;