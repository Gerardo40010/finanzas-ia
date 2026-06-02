import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

type Page = 'dashboard' | 'transactions';

// (Observer)
function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="navbar-logo">
            <span style={{ fontSize: '1.75rem' }}></span>
            <span>Gestion de Finanzas IA</span>
            <span className="navbar-badge">Inteligencia Artificial</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              background: 'var(--gray-100)', 
              padding: '0.25rem', 
              borderRadius: 'var(--radius-lg)' 
            }}>
              <button
                onClick={() => setCurrentPage('dashboard')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  background: currentPage === 'dashboard' ? 'var(--primary-500)' : 'transparent',
                  color: currentPage === 'dashboard' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('transactions')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  background: currentPage === 'transactions' ? 'var(--primary-500)' : 'transparent',
                  color: currentPage === 'transactions' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Transacciones
              </button>
            </div>
            
            {/* Toggle modo oscuro - Observer notifica cambios */}
            <div 
              onClick={toggleTheme}
              style={{
                width: '48px',
                height: '24px',
                borderRadius: '12px',
                background: theme === 'dark' ? 'var(--primary-500)' : 'var(--gray-300)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  top: '2px',
                  left: theme === 'dark' ? '26px' : '2px',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container" style={{ padding: '2rem 0' }}>
        {currentPage === 'dashboard' ? <Dashboard /> : <TransactionsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;