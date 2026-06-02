import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import type { Transaction, CreateTransactionDTO } from '../types';
import { formatCurrency } from '../utils/currency';
import { validateTransaction, validateField, getAllCategories } from '../utils/validators';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

/* ─── category icons ─────────────────────────────── */
const CATEGORY_ICONS: Record<string, string> = {
  alimentacion: '🍎', transporte: '🚗', ocio: '🎬', salario: '💰',
  suscripciones: '📺', salud: '🏥', educacion: '📚', extra: '✨',
  inversion: '📈', regalo: '🎁', servicios: '💡', otros: '📦',
};

const getIcon = (cat: string) => CATEGORY_ICONS[cat] || '📌';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

/* ─── small sub-components ───────────────────────── */
const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div style={{ marginBottom: '1.125rem' }}>
    <label className="input-label">{label}</label>
    {children}
    {error && <p className="input-error">⚠ {error}</p>}
  </div>
);

/* ─── component ──────────────────────────────────── */
const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTransactionDTO>({
    description: '', amount: 0, type: 'expense', category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeFilters, setActiveFilters] = useState({ type: 'all', category: 'all', startDate: '', endDate: '' });

  useEffect(() => { loadAllTransactions(); }, []);

  const loadAllTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch {
      toast.error('Error al cargar transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldBlur = (fieldName: string, fieldValue: string | number) => {
    const err = validateField(fieldName, fieldValue, formData.type);
    setFieldErrors(prev => ({ ...prev, [fieldName]: err || '' }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateTransaction(formData);
    if (errors.length > 0) {
      const grouped: Record<string, string> = {};
      errors.forEach(err => {
        if (err.includes('descripcion')) grouped.description = err;
        if (err.includes('monto')) grouped.amount = err;
        if (err.includes('categoria')) grouped.category = err;
      });
      setFieldErrors(grouped);
      toast.error('Por favor corrige los errores');
      return;
    }
    try {
      if (editingTransactionId) {
        await transactionService.update(editingTransactionId, formData);
        toast.success('Transacción actualizada');
      } else {
        await transactionService.create(formData);
        toast.success('Transacción creada');
      }
      setIsModalOpen(false);
      resetForm();
      loadAllTransactions();
    } catch {
      toast.error('Error al guardar transacción');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionService.delete(id);
      toast.success('Transacción eliminada');
      loadAllTransactions();
    } catch {
      toast.error('Error al eliminar transacción');
    }
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      description: t.description, amount: t.amount, type: t.type,
      category: t.category, date: t.date.split('T')[0],
    });
    setEditingTransactionId(t.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ description: '', amount: 0, type: 'expense', category: '', date: new Date().toISOString().split('T')[0] });
    setEditingTransactionId(null);
    setFieldErrors({});
  };

  const filtered = transactions.filter(t => {
    if (activeFilters.type !== 'all' && t.type !== activeFilters.type) return false;
    if (activeFilters.category !== 'all' && t.category !== activeFilters.category) return false;
    if (activeFilters.startDate && new Date(t.date) < new Date(activeFilters.startDate)) return false;
    if (activeFilters.endDate && new Date(t.date) > new Date(activeFilters.endDate)) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Fecha', 'Descripcion', 'Categoria', 'Tipo', 'Monto (Bs)'];
    const rows = filtered.map(t => [
      new Date(t.date).toLocaleDateString('es-BO'),
      t.description, t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount.toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast.success(`${filtered.length} transacciones exportadas`);
  };

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const categoryOptions = getAllCategories().map(c => ({ value: c, label: c }));
  const uniqueCategories = ['all', ...new Set(transactions.map(t => t.category))];

  /* ── skeleton ─────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton width="220px" height="36px" />
        <Skeleton width="180px" height="18px" marginTop="10px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '18px', marginTop: '28px' }}>
          <Skeleton height="96px" /><Skeleton height="96px" />
        </div>
        <Skeleton height="56px" marginTop="24px" />
        <Skeleton height="380px" marginTop="16px" />
      </div>
    );
  }

  /* ── select style helper ──────────────── */
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.875rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.875rem',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{ marginBottom: '2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
            fontWeight: 700, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', lineHeight: 1.1,
          }}>
            Transacciones
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
            Gestiona tus ingresos y gastos de forma inteligente
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          + Nueva transacción
        </button>
      </div>

      {/* ── KPI mini-cards ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'var(--success-muted)',
          border: '1px solid rgba(0,200,150,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.125rem 1.375rem',
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--success)', opacity: 0.8, marginBottom: '4px' }}>
            Total ingresos
          </p>
          <p style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div style={{
          background: 'var(--danger-muted)',
          border: '1px solid rgba(255,71,87,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.125rem 1.375rem',
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)', opacity: 0.8, marginBottom: '4px' }}>
            Total gastos
          </p>
          <p style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>
            {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="card" style={{ padding: '1.125rem 1.375rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          <div style={{ flex: 1, minWidth: '110px' }}>
            <label className="input-label">Tipo</label>
            <select style={selectStyle} value={activeFilters.type}
              onChange={e => setActiveFilters({ ...activeFilters, type: e.target.value })}>
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>

          <div style={{ flex: 1.4, minWidth: '130px' }}>
            <label className="input-label">Categoría</label>
            <select style={selectStyle} value={activeFilters.category}
              onChange={e => setActiveFilters({ ...activeFilters, category: e.target.value })}>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'Todas' : c}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '120px' }}>
            <label className="input-label">Desde</label>
            <input type="date" style={{ ...selectStyle, cursor: 'text' }}
              value={activeFilters.startDate}
              onChange={e => setActiveFilters({ ...activeFilters, startDate: e.target.value })} />
          </div>

          <div style={{ flex: 1, minWidth: '120px' }}>
            <label className="input-label">Hasta</label>
            <input type="date" style={{ ...selectStyle, cursor: 'text' }}
              value={activeFilters.endDate}
              onChange={e => setActiveFilters({ ...activeFilters, endDate: e.target.value })} />
          </div>

          <button
            className="btn btn-ghost"
            style={{ alignSelf: 'flex-end', fontSize: '0.8125rem' }}
            onClick={() => setActiveFilters({ type: 'all', category: 'all', startDate: '', endDate: '' })}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ── Transaction list ─────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* list header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.375rem',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Historial
            </h2>
            <span style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: '999px', padding: '2px 9px',
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
            }}>
              {filtered.length}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={exportCSV} style={{ fontSize: '0.8125rem' }}>
            ↓ Exportar CSV
          </button>
        </div>

        {/* rows */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No hay transacciones</p>
            <p style={{ fontSize: '0.8rem' }}>Prueba ajustando los filtros</p>
          </div>
        ) : (
          <div>
            {filtered.map(t => (
              <div key={t.id} className="transaction-item">
                {/* left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                  <div className={`category-icon category-icon-${t.type}`}>
                    {getIcon(t.category)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {t.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', alignItems: 'center' }}>
                      <span className="pill" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '1px 6px', fontSize: '0.7rem' }}>
                        {t.category}
                      </span>
                      <span>·</span>
                      <span>{fmtDate(t.date)}</span>
                    </div>
                  </div>
                </div>

                {/* right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
                    color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                    minWidth: '90px', textAlign: 'right',
                  }}>
                    {t.type === 'expense' ? '−' : '+'} {formatCurrency(t.amount)}
                  </p>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: 'var(--radius-md)' }}
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        padding: '0.35rem 0.75rem', fontSize: '0.78rem',
                        borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                        background: 'var(--danger-muted)', color: 'var(--danger)',
                        fontFamily: 'var(--font-sans)', fontWeight: 600,
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-muted)'; e.currentTarget.style.color = 'var(--danger)'; }}
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

      {/* ── Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>

            {/* modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.375rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {editingTransactionId ? 'Editar transacción' : 'Nueva transacción'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {editingTransactionId ? 'Modifica los datos de la transacción' : 'Registra un ingreso o gasto'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-tertiary)', cursor: 'pointer',
                  fontSize: '1.1rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-muted)'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ×
              </button>
            </div>

            {/* modal body */}
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '1.375rem 1.5rem' }}>

                <FormField label="Descripción" error={fieldErrors.description}>
                  <input
                    className={`input-field ${fieldErrors.description ? 'error' : ''}`}
                    type="text"
                    value={formData.description}
                    placeholder="Ej: Compra supermercado"
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onBlur={e => handleFieldBlur('description', e.target.value)}
                  />
                </FormField>

                <FormField label="Monto (Bs)" error={fieldErrors.amount}>
                  <input
                    className={`input-field ${fieldErrors.amount ? 'error' : ''}`}
                    type="number"
                    value={formData.amount}
                    placeholder="0"
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    onBlur={e => handleFieldBlur('amount', parseFloat(e.target.value))}
                  />
                </FormField>

                {/* Type toggle */}
                <FormField label="Tipo">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {(['expense', 'income'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type, category: '' })}
                        style={{
                          padding: '0.625rem',
                          borderRadius: 'var(--radius-lg)',
                          border: `1.5px solid ${formData.type === type
                            ? (type === 'income' ? 'var(--success)' : 'var(--danger)')
                            : 'var(--border-color)'}`,
                          background: formData.type === type
                            ? (type === 'income' ? 'var(--success-muted)' : 'var(--danger-muted)')
                            : 'var(--bg-tertiary)',
                          color: formData.type === type
                            ? (type === 'income' ? 'var(--success)' : 'var(--danger)')
                            : 'var(--text-secondary)',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600, fontSize: '0.875rem',
                          cursor: 'pointer', transition: 'all 150ms ease',
                        }}
                      >
                        {type === 'income' ? '↑ Ingreso' : '↓ Gasto'}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Categoría" error={fieldErrors.category}>
                  <select
                    className={`input-field ${fieldErrors.category ? 'error' : ''}`}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    onBlur={e => handleFieldBlur('category', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categoryOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Fecha">
                  <input
                    className="input-field"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormField>
              </div>

              {/* modal footer */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: '10px',
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                borderBottomLeftRadius: 'var(--radius-3xl)',
                borderBottomRightRadius: 'var(--radius-3xl)',
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTransactionId ? 'Actualizar' : 'Crear transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;