import React, { useState, useEffect } from 'react';
import { transactionService, aiService } from '../services/api';
import { formatCurrency, calculatePercentage } from '../utils/currency';
import type { TransactionSummary, AIAdvice } from '../types';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Skeleton from '../components/ui/Skeleton';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    loadData();
    loadAIAdvice();
  }, []);

  const loadData = async () => {
    try {
      const data = await transactionService.getSummary();
      setSummary(data);
    } catch (error) {
      toast.error('Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  };

  const loadAIAdvice = async () => {
    try {
      const data = await aiService.getAdvice();
      setAiAdvice(data);
    } catch (error) {
      console.error('Error loading AI advice:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const pieData = summary?.byCategory
    .filter(cat => cat.type === 'expense' && cat.total > 0)
    .map((cat, index) => ({
      name: cat.category,
      value: cat.total,
      color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][index % 6]
    })) || [];

  const barData = summary?.byCategory
    .filter(cat => cat.type === 'expense' && cat.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(cat => ({
      category: cat.category,
      monto: cat.total
    })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'var(--bg-primary)', 
          padding: '8px 12px', 
          borderRadius: '8px', 
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: payload[0].color }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton width="300px" height="40px" />
        <Skeleton width="200px" height="20px" marginTop="8px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px' }}>
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </div>
        <Skeleton height="300px" marginTop="24px" />
        <Skeleton height="200px" marginTop="24px" />
      </div>
    );
  }

  const balance = (summary?.balance || 0);
  const isPositive = balance >= 0;

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
          Dashboard Financiero
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          El camino inteligente hacia tu tranquilidad económica.
        </p>
      </div>

      {/* Tarjetas de estadisticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ 
          background: 'var(--bg-primary)', 
          borderRadius: '24px', 
          padding: '24px', 
          boxShadow: 'var(--shadow-sm)', 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--success), #34d399)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ingresos Totales</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: 'var(--success)' }}>
            {formatCurrency(summary?.totalIncome || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Ultimos 30 dias</div>
        </div>

        <div style={{ 
          background: 'var(--bg-primary)', 
          borderRadius: '24px', 
          padding: '24px', 
          boxShadow: 'var(--shadow-sm)', 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--danger), #f87171)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gastos Totales</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: 'var(--danger)' }}>
            {formatCurrency(summary?.totalExpenses || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Ultimos 30 dias</div>
        </div>

        <div style={{ 
          background: 'var(--bg-primary)', 
          borderRadius: '24px', 
          padding: '24px', 
          boxShadow: 'var(--shadow-sm)', 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Balance Neto</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(balance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
            {isPositive ? 'Flujo positivo' : 'Flujo negativo'}
          </div>
        </div>
      </div>

      {/* Panel de IA */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
        borderRadius: '28px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-xl)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', fontSize: '24px' }}>
            AI
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Asistente Financiero IA</h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Analisis inteligente de tus patrones de gasto</p>
          </div>
        </div>

        {loadingAI ? (
          <div style={{ padding: '20px' }}>
            <Skeleton height="60px" marginBottom="12px" />
            <Skeleton height="60px" marginBottom="12px" />
            <Skeleton height="60px" />
          </div>
        ) : aiAdvice ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {aiAdvice.advice.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  transition: 'transform 0.2s'
                }}>
                  <span style={{ fontSize: '18px' }}> </span>
                  <span style={{ fontSize: '0.875rem' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>Prediccion proximo mes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(parseFloat(aiAdvice.prediction))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>Categoria principal</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {aiAdvice.metrics.topCategory}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', opacity: 0.7 }}>
            No se pudieron cargar las recomendaciones
          </div>
        )}
      </div>

      {/* Graficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {pieData.length > 0 && (
          <div style={{ background: 'var(--bg-primary)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Distribucion de Gastos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData.length > 0 && (
          <div style={{ background: 'var(--bg-primary)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Top 5 Categorias de Gasto
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="monto" fill="var(--primary-500)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Lista de categorias con barras */}
      <div style={{ background: 'var(--bg-primary)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>
          Detalle de Gastos por Categoria
        </h3>
        <div>
          {summary?.byCategory
            .filter(cat => cat.type === 'expense' && cat.total > 0)
            .sort((a, b) => b.total - a.total)
            .map((cat) => {
              const percentage = calculatePercentage(cat.total, summary.totalExpenses);
              const getColor = () => {
                if (percentage > 40) return '#ef4444';
                if (percentage > 20) return '#f59e0b';
                return '#10b981';
              };
              return (
                <div key={cat.category} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500', textTransform: 'capitalize', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {cat.category}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      {formatCurrency(cat.total)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--gray-200)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: getColor(),
                        borderRadius: '9999px',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;