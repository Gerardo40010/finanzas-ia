import { CreateTransactionDTO } from '../types';

export const validateTransaction = (data: Partial<CreateTransactionDTO>): string[] => {
  const errors: string[] = [];

  if (!data.description || data.description.trim().length < 2) {
    errors.push('La descripción debe tener al menos 2 caracteres');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }

  if (data.amount && data.amount > 100000) {
    errors.push('El monto no puede superar 100,000');
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('El tipo debe ser "income" o "expense"');
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push('La categoría debe tener al menos 2 caracteres');
  }

  return errors;
};

export const validCategories = [
  'alimentacion', 'transporte', 'ocio', 'salario', 
  'suscripciones', 'salud', 'educacion', 'extra', 'otros'
];