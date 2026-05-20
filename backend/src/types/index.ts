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

export interface AIAdviceResponse {
  advice: string[];
  timestamp: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    topCategory: string;
  };
}