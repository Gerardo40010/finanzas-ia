import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

/**
 * PATRÓN SINGLETON
 * Garantiza que solo exista una única instancia de la conexión a la base de datos
 * en toda la aplicación. Esto evita múltiples conexiones abiertas y conflictos
 * de concurrencia.
 * 
 * Tipo: Patrón Creacional
 * GoF: Sí
 */
class DatabaseSingleton {
  private static instance: Database | null = null;
  private static dbPath: string;

  private constructor() {}

  /**
   * Método estático que devuelve la única instancia de la base de datos.
   * Si no existe, la crea. Si ya existe, la reutiliza.
   */
  public static async getInstance(): Promise<Database> {
    if (!DatabaseSingleton.instance) {
      // Determinar ruta de la base de datos
      const dbDir = path.join(process.cwd(), 'database');
      DatabaseSingleton.dbPath = path.join(dbDir, 'finanzas.db');

      // Crear carpeta si no existe
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      console.log(`📁 Base de datos Singleton en: ${DatabaseSingleton.dbPath}`);

      // Abrir conexión
      DatabaseSingleton.instance = await open({
        filename: DatabaseSingleton.dbPath,
        driver: sqlite3.Database
      });

      // Crear tablas
      await DatabaseSingleton.instance.exec(`
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

      // Insertar datos de ejemplo si está vacío
      const count = await DatabaseSingleton.instance.get('SELECT COUNT(*) as total FROM transactions');
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
          await DatabaseSingleton.instance.run(
            `INSERT INTO transactions (id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)`,
            tx.id, tx.description, tx.amount, tx.type, tx.category, tx.date
          );
        }
        console.log('✅ Datos de ejemplo insertados');
      }
      
      console.log('✅ Singleton: Base de datos inicializada correctamente');
    }
    return DatabaseSingleton.instance;
  }

  /**
   * Método para obtener la instancia sin inicializar (útil para consultas rápidas)
   */
  public static getExistingInstance(): Database | null {
    return DatabaseSingleton.instance;
  }

  /**
   * Método para cerrar la conexión (útil para pruebas o apagar la aplicación)
   */
  public static async closeInstance(): Promise<void> {
    if (DatabaseSingleton.instance) {
      await DatabaseSingleton.instance.close();
      DatabaseSingleton.instance = null;
      console.log('🔒 Conexión a base de datos cerrada (Singleton)');
    }
  }
}

// Actualizar los controladores para usar el Singleton en lugar de getDatabase()

// Ejemplo de cómo usar en transactionController.ts:
// const db = await DatabaseSingleton.getInstance();
// const transactions = await db.all('SELECT * FROM transactions');

export default DatabaseSingleton;