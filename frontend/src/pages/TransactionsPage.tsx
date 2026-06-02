import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import type { Transaction, CreateTransactionDTO } from '../types';
import { formatCurrency } from '../utils/currency';
import { validateTransaction, validateField, getAllCategories } from '../utils/validators';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTransactionDTO>({
    description: '',
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadAllTransactions();
  }, []);

  const loadAllTransactions = async () => {
    try {
      const transactionsFromApi = await transactionService.getAll();
      const transactionData = transactionsFromApi;
      setTransactions(transactionData);
    } catch (apiError) {
      toast.error('Error al cargar transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldBlur = (fieldName: string, fieldValue: string | number) => {
    const validationErrorMessage = validateField(fieldName, fieldValue, formData.type);
    setFieldErrors(previousErrors => ({ ...previousErrors, [fieldName]: validationErrorMessage || '' }));
  };

  const handleFormSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    
    const validationErrors = validateTransaction(formData);
    if (validationErrors.length > 0) {
      const errorsGroupedByField: Record<string, string> = {};
      validationErrors.forEach(singleError => {
        if (singleError.includes('descripcion')) errorsGroupedByField.description = singleError;
        if (singleError.includes('monto')) errorsGroupedByField.amount = singleError;
        if (singleError.includes('categoria')) errorsGroupedByField.category = singleError;
      });
      setFieldErrors(errorsGroupedByField);
      toast.error('Por favor corrige los errores');
      return;
    }
    
    try {
      if (editingTransactionId) {
        await transactionService.update(editingTransactionId, formData);
        toast.success('Transaccion actualizada');
      } else {
        await transactionService.create(formData);
        toast.success('Transaccion creada');
      }
      setIsModalOpen(false);
      resetFormFields();
      loadAllTransactions();
    } catch (apiError) {
      toast.error('Error al guardar transaccion');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionService.delete(transactionId);
      toast.success('Transaccion eliminada');
      loadAllTransactions();
    } catch (apiError) {
      toast.error('Error al eliminar transaccion');
    }
  };

  const handleEditTransaction = (transactionToEdit: Transaction) => {
    setFormData({
      description: transactionToEdit.description,
      amount: transactionToEdit.amount,
      type: transactionToEdit.type,
      category: transactionToEdit.category,
      date: transactionToEdit.date.split('T')[0]
    });
    setEditingTransactionId(transactionToEdit.id);
    setIsModalOpen(true);
  };

  const resetFormFields = () => {
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransactionId(null);
    setFieldErrors({});
  };

  const getFilteredTransactionList = () => {
    return transactions.filter(singleTransaction => {
      if (activeFilters.type !== 'all' && singleTransaction.type !== activeFilters.type) return false;
      if (activeFilters.category !== 'all' && singleTransaction.category !== activeFilters.category) return false;
      if (activeFilters.startDate && new Date(singleTransaction.date) < new Date(activeFilters.startDate)) return false;
      if (activeFilters.endDate && new Date(singleTransaction.date) > new Date(activeFilters.endDate)) return false;
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactionList();

  const exportTransactionsToCSV = () => {
    const csvHeaders = ['Fecha', 'Descripcion', 'Categoria', 'Tipo', 'Monto (Bs)'];
    const csvRows = filteredTransactions.map(singleTransaction => [
      new Date(singleTransaction.date).toLocaleDateString('es-BO'),
      singleTransaction.description,
      singleTransaction.category,
      singleTransaction.type === 'income' ? 'Ingreso' : 'Gasto',
      singleTransaction.amount.toString()
    ]);
    
    const csvFileContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');
    
    const csvBlob = new Blob(['\uFEFF' + csvFileContent], { type: 'text/csv;charset=utf-8;' });
    const downloadLink = document.createElement('a');
    const blobUrl = URL.createObjectURL(csvBlob);
    downloadLink.href = blobUrl;
    downloadLink.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
    
    toast.success(`${filteredTransactions.length} transacciones exportadas`);
  };

  const totalIncomeAmount = filteredTransactions
    .filter(singleTransaction => singleTransaction.type === 'income')
    .reduce((accumulatedSum, singleTransaction) => accumulatedSum + singleTransaction.amount, 0);
  
  const totalExpensesAmount = filteredTransactions
    .filter(singleTransaction => singleTransaction.type === 'expense')
    .reduce((accumulatedSum, singleTransaction) => accumulatedSum + singleTransaction.amount, 0);

  const availableCategoryOptions = getAllCategories().map(categoryName => ({ value: categoryName, label: categoryName }));
  const uniqueCategoryNames = ['all', ...new Set(transactions.map(singleTransaction => singleTransaction.category))];

  const getIconForCategory = (categoryName: string): string => {
    const categoryIcons: Record<string, string> = {
      alimentacion: '🍎', transporte: '🚗', ocio: '🎬', salario: '💰',
      suscripciones: '📺', salud: '🏥', educacion: '📚', extra: '✨',
      inversion: '📈', regalo: '🎁', servicios: '💡', otros: '📦'
    };
    return categoryIcons[categoryName] || '📌';
  };

  const formatTransactionDate = (dateString: string) => {
    const transactionDate = new Date(dateString);
    return transactionDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
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
              value={activeFilters.type}
              onChange={(event) => setActiveFilters({...activeFilters, type: event.target.value})}
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
              value={activeFilters.category}
              onChange={(event) => setActiveFilters({...activeFilters, category: event.target.value})}
            >
              {uniqueCategoryNames.map(categoryName => (
                <option key={categoryName} value={categoryName}>{categoryName === 'all' ? 'Todas' : categoryName}</option>
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
              value={activeFilters.startDate}
              onChange={(event) => setActiveFilters({...activeFilters, startDate: event.target.value})}
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
              value={activeFilters.endDate}
              onChange={(event) => setActiveFilters({...activeFilters, endDate: event.target.value})}
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
            onClick={() => setActiveFilters({type: 'all', category: 'all', startDate: '', endDate: ''})}
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
            {formatCurrency(totalIncomeAmount)}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderRadius: '20px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px' }}>Total Gastos</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626' }}>
            {formatCurrency(totalExpensesAmount)}
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
              onClick={exportTransactionsToCSV} 
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
              onMouseEnter={(event) => event.currentTarget.style.background = 'var(--gray-300)'}
              onMouseLeave={(event) => event.currentTarget.style.background = 'var(--gray-200)'}
            >
              Exportar CSV
            </button>
            <button 
              onClick={() => { resetFormFields(); setIsModalOpen(true); }}
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
              onMouseEnter={(event) => event.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(event) => event.currentTarget.style.opacity = '1'}
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
            {filteredTransactions.map(singleTransaction => (
              <div 
                key={singleTransaction.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(event) => event.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={(event) => event.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: singleTransaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {getIconForCategory(singleTransaction.category)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {singleTransaction.description}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{singleTransaction.category}</span>
                      <span>•</span>
                      <span>{formatTransactionDate(singleTransaction.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '0.875rem',
                    color: singleTransaction.type === 'income' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {singleTransaction.type === 'expense' ? '-' : '+'} {formatCurrency(singleTransaction.amount)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditTransaction(singleTransaction)}
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
                      onMouseEnter={(event) => event.currentTarget.style.background = 'var(--primary-600)'}
                      onMouseLeave={(event) => event.currentTarget.style.background = 'var(--primary-500)'}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(singleTransaction.id)}
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
                      onMouseEnter={(event) => event.currentTarget.style.background = 'var(--danger-dark)'}
                      onMouseLeave={(event) => event.currentTarget.style.background = 'var(--danger)'}
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
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'modalIn 0.3s ease',
            border: '1px solid var(--border-color)'
          }} onClick={(event) => event.stopPropagation()}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {editingTransactionId ? 'Editar Transaccion' : 'Nueva Transaccion'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descripcion</label>
                  <input
                    type="text"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `2px solid ${fieldErrors.description ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    onBlur={(event) => handleFieldBlur('description', event.target.value)}
                    placeholder="Ej: Compra supermercado"
                  />
                  {fieldErrors.description && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.description}
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
                      border: `2px solid ${fieldErrors.amount ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.amount}
                    onChange={(event) => setFormData({ ...formData, amount: parseFloat(event.target.value) })}
                    onBlur={(event) => handleFieldBlur('amount', parseFloat(event.target.value))}
                    placeholder="0"
                  />
                  {fieldErrors.amount && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.amount}
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
                      border: `2px solid ${fieldErrors.category ? 'var(--danger)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    onBlur={(event) => handleFieldBlur('category', event.target.value)}
                  >
                    <option value="">Selecciona una categoria</option>
                    {availableCategoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <small style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.category}
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
                    onChange={(event) => setFormData({ ...formData, date: event.target.value })}
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
                <button type="button" style={{ padding: '10px 20px', background: 'var(--gray-200)', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500' }}>
                  {editingTransactionId ? 'Actualizar' : 'Crear'}
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