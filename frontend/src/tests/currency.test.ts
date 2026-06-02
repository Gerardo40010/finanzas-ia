import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, calculatePercentage } from '../utils/currency';

describe('formatCurrency - Pruebas unitarias', () => {
  
  it('debe formatear 1000 a Bs 1.000,00', () => {
    const result = formatCurrency(1000);
    expect(result).toBe('Bs 1.000,00');
  });

  it('debe formatear 1234.56 a Bs 1.234,56', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('Bs 1.234,56');
  });

  it('debe formatear 0 a Bs 0,00', () => {
    const result = formatCurrency(0);
    expect(result).toBe('Bs 0,00');
  });

  it('debe formatear números negativos correctamente', () => {
    const result = formatCurrency(-500);
    expect(result).toBe('Bs -500,00');
  });

  it('debe formatear números grandes con separadores de miles', () => {
    const result = formatCurrency(1234567);
    expect(result).toBe('Bs 1.234.567,00');
  });
});

describe('formatNumber - Pruebas unitarias', () => {
  
  it('debe formatear 1000 a "1.000"', () => {
    const result = formatNumber(1000);
    expect(result).toBe('1.000');
  });

  it('debe formatear 1234567 a "1.234.567"', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1.234.567');
  });
});

describe('calculatePercentage - Pruebas unitarias', () => {
  
  it('debe calcular 50% cuando parte es 50 y total es 100', () => {
    const result = calculatePercentage(50, 100);
    expect(result).toBe(50);
  });

  it('debe devolver 0 cuando total es 0', () => {
    const result = calculatePercentage(50, 0);
    expect(result).toBe(0);
  });

  it('debe calcular 25% cuando parte es 25 y total es 100', () => {
    const result = calculatePercentage(25, 100);
    expect(result).toBe(25);
  });
});