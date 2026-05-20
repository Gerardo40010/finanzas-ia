export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt?: string;
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: Array<{
    category: string;
    type: string;
    total: number;
  }>;
}

export interface AIAdvice {
  advice: string[];
  prediction: string;
  budgetSuggestions: Record<string, number>;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    topCategory: string;
    transactionCount: number;
  };
  timestamp: string;
}