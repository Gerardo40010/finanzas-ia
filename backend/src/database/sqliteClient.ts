import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  // Determinar la ruta de la base de datos
  const dbDir = path.join(process.cwd(), 'database');
  const dbPath = path.join(dbDir, 'finanzas.db');

  // Asegurar que la carpeta existe
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`📁 Base de datos en: ${dbPath}`);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Crear tablas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);

  // Verificar si hay datos de ejemplo
  const count = await db.get('SELECT COUNT(*) as total FROM transactions');
  
  if (count.total === 0) {
    console.log('📝 Insertando datos de ejemplo...');
    const now = new Date();
    
    const sampleTransactions = [
      { id: '1', description: 'Compra supermercado', amount: 85.50, type: 'expense', category: 'alimentacion', date: new Date(now.getTime() - 5 * 86400000).toISOString() },
      { id: '2', description: 'Sueldo mensual', amount: 2500.00, type: 'income', category: 'salario', date: new Date(now.getTime() - 2 * 86400000).toISOString() },
      { id: '3', description: 'Cena restaurante', amount: 42.00, type: 'expense', category: 'ocio', date: new Date(now.getTime() - 1 * 86400000).toISOString() },
      { id: '4', description: 'Netflix', amount: 12.99, type: 'expense', category: 'suscripciones', date: new Date(now.getTime() - 10 * 86400000).toISOString() },
      { id: '5', description: 'Transporte público', amount: 25.00, type: 'expense', category: 'transporte', date: new Date(now.getTime() - 3 * 86400000).toISOString() },
      { id: '6', description: 'Gasolina', amount: 45.00, type: 'expense', category: 'transporte', date: new Date(now.getTime() - 7 * 86400000).toISOString() },
      { id: '7', description: 'Trabajo freelance', amount: 350.00, type: 'income', category: 'extra', date: new Date(now.getTime() - 4 * 86400000).toISOString() }
    ];

    for (const tx of sampleTransactions) {
      await db.run(
        `INSERT INTO transactions (id, description, amount, type, category, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        tx.id, tx.description, tx.amount, tx.type, tx.category, tx.date
      );
    }
    console.log('✅ Datos de ejemplo insertados');
  }

  console.log('✅ Base de datos inicializada correctamente');
  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}