import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import DatabaseSingleton from './database/sqliteClient';
import transactionRoutes from './routes/transactions';
import aiRoutes from './routes/ai';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.get('/', (req, res) => {
  res.json({
    name: 'Finanzas IA API',
    version: '1.0.0',
    description: 'Gestor de Finanzas Personales con Asistente Inteligente',
    endpoints: {
      transactions: '/api/transactions',
      ai: '/api/ai',
      health: '/health'
    }
  });
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


async function startServer() {
  try {
    // Usar el patrón Singleton para la base de datos
    const db = await DatabaseSingleton.getInstance();
    console.log('✅ Base de datos inicializada correctamente (Singleton)');
    
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


process.on('SIGINT', async () => {
  console.log('\n🔴 Cerrando servidor...');
  await DatabaseSingleton.closeInstance();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔴 Cerrando servidor...');
  await DatabaseSingleton.closeInstance();
  process.exit(0);
});

startServer();

export default app;