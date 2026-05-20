import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/sqliteClient';
import transactionRoutes from './routes/transactions';
import aiRoutes from './routes/ai';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'Finanzas IA API',
    version: '1.0.0',
    endpoints: {
      transactions: '/api/transactions',
      ai: '/api/ai',
      health: '/health'
    }
  });
});

// Manejo de errores global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`
      🚀 Servidor backend iniciado correctamente
      📡 Puerto: ${PORT}
      🌐 URL: http://localhost:${PORT}
      📊 API de transacciones: http://localhost:${PORT}/api/transactions
      🤖 API de IA: http://localhost:${PORT}/api/ai
      `);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;