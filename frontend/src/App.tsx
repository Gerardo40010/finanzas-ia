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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />

      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <div className="logo-icon"></div>
            <span>Gestion de Finanzas </span>
            <span className="navbar-badge">ia integrada</span>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Page tabs */}
            <div className="nav-pills">
              <button
                className={`nav-pill ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-pill ${currentPage === 'transactions' ? 'active' : ''}`}
                onClick={() => setCurrentPage('transactions')}
              >
                Transacciones
              </button>
            </div>

            {/* Dark mode toggle — Observer notifica cambios */}
            <div
              className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              <div className="theme-toggle-knob" />
            </div>
          </div>
        </div>
      </nav>

      <main className="container" style={{ padding: '2.25rem 0', position: 'relative', zIndex: 1 }}>
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