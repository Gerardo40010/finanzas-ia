import { describe, it, expect } from 'vitest';
import { validateTransaction, validateField, getAllCategories } from '../utils/validators';

describe('validateTransaction - Pruebas unitarias', () => {
  
  it('debe pasar la validación con datos correctos', () => {
    const validData = {
      description: 'Compra supermercado',
      amount: 5000,
      category: 'alimentacion'
    };
    const errors = validateTransaction(validData);
    expect(errors.length).toBe(0);
  });

  it('debe detectar descripción demasiado corta', () => {
    const invalidData = {
      description: 'a',
      amount: 5000,
      category: 'alimentacion'
    };
    const errors = validateTransaction(invalidData);
    expect(errors.some(error => error.includes('descripción'))).toBe(true);
  });

  it('debe detectar descripción demasiado larga', () => {
    const invalidData = {
      description: 'a'.repeat(51),
      amount: 5000,
      category: 'alimentacion'
    };
    const errors = validateTransaction(invalidData);
    expect(errors.some(error => error.includes('descripción'))).toBe(true);
  });

  it('debe detectar monto igual a cero', () => {
    const invalidData = {
      description: 'Compra',
      amount: 0,
      category: 'alimentacion'
    };
    const errors = validateTransaction(invalidData);
    expect(errors.some(error => error.includes('monto'))).toBe(true);
  });

  it('debe detectar categoría vacía', () => {
    const invalidData = {
      description: 'Compra',
      amount: 5000,
      category: ''
    };
    const errors = validateTransaction(invalidData);
    expect(errors.some(error => error.includes('categoría'))).toBe(true);
  });

  it('debe devolver múltiples errores cuando hay varios problemas', () => {
    const invalidData = {
      description: '',
      amount: 0,
      category: ''
    };
    const errors = validateTransaction(invalidData);
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('validateField - Pruebas unitarias', () => {
  
  it('debe validar correctamente el campo description', () => {
    const error = validateField('description', 'Compra válida', 'expense');
    expect(error).toBeNull();
  });

  it('debe rechazar description corta', () => {
    const error = validateField('description', 'ab', 'expense');
    expect(error).toContain('3 caracteres');
  });

  it('debe validar correctamente el campo amount', () => {
    const error = validateField('amount', 100, 'expense');
    expect(error).toBeNull();
  });

  it('debe rechazar amount negativo', () => {
    const error = validateField('amount', -50, 'expense');
    expect(error).toContain('mayor a 0');
  });

  it('debe validar correctamente el campo category', () => {
    const error = validateField('category', 'alimentacion', 'expense');
    expect(error).toBeNull();
  });

  it('debe rechazar category vacía', () => {
    const error = validateField('category', '', 'expense');
    expect(error).toContain('seleccionar una categoría');
  });
});

describe('getAllCategories - Pruebas unitarias', () => {
  
  it('debe devolver un arreglo de categorías', () => {
    const categories = getAllCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('debe incluir categorías de ingresos y gastos', () => {
    const categories = getAllCategories();
    expect(categories).toContain('salario');
    expect(categories).toContain('alimentacion');
    expect(categories).toContain('transporte');
    expect(categories).toContain('ocio');
  });
});