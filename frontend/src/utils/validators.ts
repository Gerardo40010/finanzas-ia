export const validateTransaction = (data: {
  description: string;
  amount: number;
  category: string;
}): string[] => {
  const errors: string[] = [];

  if (!data.description || data.description.trim().length < 3) {
    errors.push('La descripción debe tener al menos 3 caracteres');
  }
  if (data.description && data.description.trim().length > 50) {
    errors.push('La descripción no puede exceder 50 caracteres');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }
  if (data.amount > 100000000) {
    errors.push('El monto no puede superar 100,000,000');
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push('Debes seleccionar una categoría');
  }

  return errors;
};

// Validación por campo individual (para tiempo real)
export const validateField = (
  field: string,
  value: string | number,
  type: 'income' | 'expense'
): string | null => {
  switch (field) {
    case 'description':
      if (!value || String(value).trim().length < 3) {
        return 'La descripción debe tener al menos 3 caracteres';
      }
      if (String(value).trim().length > 50) {
        return 'La descripción no puede exceder 50 caracteres';
      }
      return null;

    case 'amount':
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        return 'El monto debe ser mayor a 0';
      }
      if (numValue > 100000000) {
        return 'El monto no puede superar 100,000,000';
      }
      return null;

    case 'category':
      if (!value || String(value).trim().length < 2) {
        return 'Debes seleccionar una categoría';
      }
      return null;

    default:
      return null;
  }
};

export const categories = {
  income: ['salario', 'extra', 'inversion', 'regalo', 'otros'],
  expense: ['alimentacion', 'transporte', 'ocio', 'suscripciones', 'salud', 'educacion', 'servicios', 'otros']
};

export const getAllCategories = () => [...categories.income, ...categories.expense];