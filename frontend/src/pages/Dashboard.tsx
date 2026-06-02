import React, { useState, useEffect } from 'react';
import { transactionService, aiService } from '../services/api';
import { formatCurrency, calculatePercentage } from '../utils/currency';
import type { TransactionSummary, AIAdvice } from '../types';
import { toast } from 'react-hot-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Skeleton from '../components/ui/Skeleton';

/* ─── palette for charts ─────────────────────────── */
const CHART_COLORS = ['#3b6fd4', '#00c896', '#ffc947', '#ff4757', '#a78bfa', '#00d4ff'];

/* ─── helpers ────────────────────────────────────── */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>{payload[0].name}</p>
        <p style={{ color: payload[0].color, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{label}</p>
        <p style={{ color: 'var(--brand-300)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

/* ─── percentage bar color ───────────────────────── */
const pctColor = (pct: number) =>
  pct > 40 ? 'var(--danger)' : pct > 20 ? 'var(--warning)' : 'var(--success)';

/* ─── component ──────────────────────────────────── */
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
    } catch {
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
    .filter(c => c.type === 'expense' && c.total > 0)
    .map((c, i) => ({ name: c.category, value: c.total, color: CHART_COLORS[i % CHART_COLORS.length] })) || [];

  const barData = summary?.byCategory
    .filter(c => c.type === 'expense' && c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(c => ({ category: c.category, monto: c.total })) || [];

  /* ── skeleton ─────────────────────────── */
  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton width="280px" height="36px" />
        <Skeleton width="220px" height="18px" marginTop="10px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginTop: '28px' }}>
          <Skeleton height="110px" /><Skeleton height="110px" /><Skeleton height="110px" />
        </div>
        <Skeleton height="280px" marginTop="28px" />
        <Skeleton height="280px" marginTop="24px" />
      </div>
    );
  }

  const balance = summary?.balance || 0;
  const isPositive = balance >= 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}>
            Dashboard Financiero
          </h1>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--brand-300)',
            border: '1.5px solid var(--brand-300)', borderRadius: '999px',
            padding: '0.2rem 0.6rem',
          }}>
            Últimos 30 días
          </span>
        </div>
        <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
          El camino inteligente hacia tu tranquilidad económica.
        </p>
      </div>

      {/* ── KPI cards ───────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.125rem',
        marginBottom: '2rem',
      }}>
        {/* Ingresos */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Ingresos totales
              </p>
              <p style={{
                fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em',
                marginTop: '0.5rem', fontFamily: 'var(--font-mono)',
                color: 'var(--success)',
              }}>
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--success-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
            }}>↑</div>
          </div>
          <div style={{ marginTop: '1rem', height: '3px', borderRadius: 2, background: 'var(--success)', opacity: 0.25 }} />
        </div>

        {/* Gastos */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Gastos totales
              </p>
              <p style={{
                fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em',
                marginTop: '0.5rem', fontFamily: 'var(--font-mono)',
                color: 'var(--danger)',
              }}>
                {formatCurrency(summary?.totalExpenses || 0)}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--danger-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
            }}>↓</div>
          </div>
          <div style={{ marginTop: '1rem', height: '3px', borderRadius: 2, background: 'var(--danger)', opacity: 0.25 }} />
        </div>

        {/* Balance */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Balance neto
              </p>
              <p style={{
                fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em',
                marginTop: '0.5rem', fontFamily: 'var(--font-mono)',
                color: isPositive ? 'var(--success)' : 'var(--danger)',
              }}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: isPositive ? 'var(--success-muted)' : 'var(--danger-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
            }}>
              {isPositive ? '✦' : '!'}
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isPositive ? 'var(--success)' : 'var(--danger)',
            }}>
              {isPositive ? '● Flujo positivo' : '● Flujo negativo'}
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Panel ────────────────────────────────── */}
      <div className="ai-panel" style={{ marginBottom: '2rem' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 15,
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 0 20px rgba(0,212,255,0.12)',
          }}>
            ✦
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>
              Asistente Financiero IA
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
              Análisis inteligente de tus patrones de gasto
            </p>
          </div>
        </div>

        {/* content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {loadingAI ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[80, 65, 70].map((w, i) => (
                <div key={i} style={{ height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : aiAdvice ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {aiAdvice.advice.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <span style={{ color: 'var(--accent-400)', fontSize: '0.75rem', marginTop: '2px', flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '1.125rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>
                    Predicción próximo mes
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>
                    {formatCurrency(parseFloat(aiAdvice.prediction))}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '1.125rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>
                    Categoría principal
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'capitalize', color: 'white' }}>
                    {aiAdvice.metrics.topCategory}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', opacity: 0.5, fontSize: '0.875rem' }}>
              No se pudieron cargar las recomendaciones
            </div>
          )}
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        {pieData.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <p className="section-title">Distribución de gastos</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={64} outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <p className="section-title">Top 5 categorías de gasto</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barSize={28}>
                <XAxis
                  dataKey="category"
                  axisLine={false} tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text x={x} y={(Number(y) + 10)} textAnchor="middle" fontSize={11} fill="var(--text-tertiary)" style={{ textTransform: 'capitalize' }}>
                      {payload.value}
                    </text>
                  )}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                  axisLine={false} tickLine={false} width={80}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="monto" fill="var(--brand-300)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Category breakdown ───────────────────────── */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <p className="section-title">Detalle por categoría</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {summary?.byCategory
            .filter(c => c.type === 'expense' && c.total > 0)
            .sort((a, b) => b.total - a.total)
            .map((cat) => {
              const pct = calculatePercentage(cat.total, summary.totalExpenses);
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontWeight: 600, textTransform: 'capitalize',
                      fontSize: '0.875rem', color: 'var(--text-primary)',
                    }}>
                      {cat.category}
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {formatCurrency(cat.total)}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                        color: pctColor(pct), minWidth: 36, textAlign: 'right',
                      }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: pctColor(pct) }}
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