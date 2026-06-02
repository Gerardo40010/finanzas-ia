import { transactionService } from '../services/api';
import type { Transaction, CreateTransactionDTO } from '../types';
import { ICommand } from './ICommand';

// Comando para crear una transacción
export class CreateTransactionCommand implements ICommand<Transaction> {
  private transactionData: CreateTransactionDTO;

  constructor(transactionData: CreateTransactionDTO) {
    this.transactionData = transactionData;
  }

  async execute(): Promise<Transaction> {
    const newTransaction = await transactionService.create(this.transactionData);
    return newTransaction;
  }

  getDescription(): string {
    return `Crear transacción: ${this.transactionData.description} - ${this.transactionData.amount} Bs`;
  }
}

// Comando para actualizar una transacción
export class UpdateTransactionCommand implements ICommand<Transaction> {
  private id: string;
  private transactionData: Partial<Transaction>;

  constructor(id: string, transactionData: Partial<Transaction>) {
    this.id = id;
    this.transactionData = transactionData;
  }

  async execute(): Promise<Transaction> {
    const updatedTransaction = await transactionService.update(this.id, this.transactionData);
    return updatedTransaction;
  }

  getDescription(): string {
    return `Actualizar transacción ${this.id}`;
  }
}

// Comando para eliminar una transacción
export class DeleteTransactionCommand implements ICommand<void> {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  async execute(): Promise<void> {
    await transactionService.delete(this.id);
  }

  getDescription(): string {
    return `Eliminar transacción ${this.id}`;
  }
}

// Comando para cargar todas las transacciones
export class LoadTransactionsCommand implements ICommand<Transaction[]> {
  async execute(): Promise<Transaction[]> {
    const transactions = await transactionService.getAll();
    return transactions;
  }

  getDescription(): string {
    return 'Cargar todas las transacciones';
  }
}

// Comando para cargar el resumen
export class LoadSummaryCommand implements ICommand<any> {
  async execute(): Promise<any> {
    const summary = await transactionService.getSummary();
    return summary;
  }

  getDescription(): string {
    return 'Cargar resumen financiero';
  }
}