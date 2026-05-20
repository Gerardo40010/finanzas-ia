import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import type { Transaction, CreateTransactionDTO } from '../types';
import { formatCurrency } from '../utils/currency';
import { validateTransaction, validateField, getAllCategories } from '../utils/validators';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTransactionDTO>({
    description: '',
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldBlur = (field: string, value: string | number) => {
    const error = validateField(field, value, formData.type);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateTransaction(formData);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.includes('descripcion')) errorObj.description = err;
        if (err.includes('monto')) errorObj.amount = err;
        if (err.includes('categoria')) errorObj.category = err;
      });
      setErrors(errorObj);
      toast.error('Por favor corrige los errores');
      return;
    }
    
    try {
      if (editingId) {
        await transactionService.update(editingId, formData);
        toast.success('Transaccion actualizada', {
          duration: 3000,
          style: { background: 'var(--success)', color: 'white', borderRadius: '16px' }
        });
      } else {
        await transactionService.create(formData);
        toast.success('Transaccion creada', {
          duration: 3000,
          style: { background: 'var(--success)', color: 'white', borderRadius: '16px' }
        });
      }
      setShowModal(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      toast.error('Error al guardar transaccion');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionService.delete(id);
      toast.success('Transaccion eliminada', {
        duration: 3000,
        style: { background: 'var(--danger)', color: 'white', borderRadius: '16px' }
      });
      loadTransactions();
    } catch (error) {
      toast.error('Error al eliminar transaccion');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.split('T')[0]
    });
    setEditingId(transaction.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setErrors({});
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const exportToCSV = () => {
    const headers = ['Fecha', 'Descripcion', 'Categoria', 'Tipo', 'Monto (Bs)'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('es-BO'),
      t.description,
      t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount.toString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredTransactions.length} transacciones exportadas`, {
      duration: 3000,
      style: { background: 'var(--primary-500)', color: 'white', borderRadius: '16px' }
    });
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryOptions = getAllCategories().map(cat => ({ value: cat, label: cat }));
  const uniqueCategories = ['all', ...new Set(transactions.map(t => t.category))];

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      alimentacion: '🍎', transporte: '🚗', ocio: '🎬', salario: '💰',
      suscripciones: '📺', salud: '🏥', educacion: '📚', extra: '✨',
      inversion: '📈', regalo: '🎁', servicios: '💡', otros: '📦'
    };
    return icons[category] || '📌';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton width="250px" height="40px" />
        <Skeleton width="180px" height="20px" marginTop="8px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '24px' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
        <Skeleton height="60px" marginTop="24px" />
        <Skeleton height="400px" marginTop="16px" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Transacciones
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Gestiona tus ingresos y gastos de forma inteligente
        </p>
      </div>

      {/* Filtros */}
      <div style={{ 
        background: 'var(--bg-primary)', 
        borderRadius: '24px', 
        padding: '20px', 
        marginBottom: '24px', 
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Filtrar transacciones
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Tipo</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '2px solid var(--border-color)', 
                borderRadius: '12px', 
                fontSize: '0.875rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Categoria</label>
            <select 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '2px solid var(--border-color)', 
                borderRadius: '12px', 
                fontSize: '0.875rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'Todas' : cat}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '130px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Desde</label>
            <input
              type="date"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '2px solid var(--border-color)', 
                borderRadius: '12px', 
                fontSize: '0.875rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '130px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Hasta</label>
            <input
              type="date"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '2px solid var(--border-color)', 
                borderRadius: '12px', 
                fontSize: '0.875rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          
          <button 
            style={{ 
              padding: '8px 16px', 
              height: '38px', 
              background: 'var(--gray-200)', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}
            onClick={() => setFilters({type: 'all', category: 'all', startDate: '', endDate: ''})}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '20px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '4px' }}>Total Ingresos</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderRadius: '20px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px' }}>Total Gastos</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626' }}>
            {formatCurrency(totalExpenses)}
          </div>
        </div>
      </div>

      {/* Lista de transacciones */}
      <div style={{ 
        background: 'var(--bg-primary)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Historial de Transacciones
              <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                ({filteredTransactions.length})
              </span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={exportToCSV} 
              style={{ 
                padding: '8px 20px', 
                background: 'var(--gray-200)', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '500',
                color: 'var(--text-primary)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-300)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gray-200)'}
            >
              Exportar CSV
            </button>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              style={{ 
                padding: '8px 20px', 
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Nueva Transaccion
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p>No hay transacciones que coincidan con los filtros</p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map(transaction => (
              <div 
                key={transaction.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {transaction.description}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{transaction.category}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '0.875rem',
                    color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {transaction.type === 'expense' ? '-' : '+'} {formatCurrency(transaction.amount)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(transaction)}
                      style={{
                        background: 'var(--primary-500)',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-600)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-500)'}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      style={{
                        background: 'var(--danger)',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--danger)'}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'modalIn 0.3s ease',
            border: '1px solid var(--border-color)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {editingId ? 'Editar Transaccion' : 'Nueva Transaccion'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'var(--gray-200)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descripcion</label>
                  <input
                    type="text"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `2px solid ${errors.description ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={(e) => handleFieldBlur('description', e.target.value)}
                    placeholder="Ej: Compra supermercado"
                  />
                  {errors.description && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {errors.description}
                    </small>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Monto (Bs)</label>
                  <input
                    type="number"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `2px solid ${errors.amount ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    onBlur={(e) => handleFieldBlur('amount', parseFloat(e.target.value))}
                    placeholder="0"
                  />
                  {errors.amount && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {errors.amount}
                    </small>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tipo</label>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="radio"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={() => setFormData({ ...formData, type: 'expense', category: '' })}
                      />
                      <span>Gasto</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="radio"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={() => setFormData({ ...formData, type: 'income', category: '' })}
                      />
                      <span>Ingreso</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Categoria</label>
                  <select
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `2px solid ${errors.category ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    onBlur={(e) => handleFieldBlur('category', e.target.value)}
                  >
                    <option value="">Selecciona una categoria</option>
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {errors.category}
                    </small>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Fecha</label>
                  <input
                    type="date"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid var(--border-color)', 
                      borderRadius: '16px', 
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)'
              }}>
                <button type="button" style={{ padding: '10px 20px', background: 'var(--gray-200)', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500' }}>
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionsPage;