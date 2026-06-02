import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import DatabaseSingleton from '../database/sqliteClient';
import { validateTransaction, validCategories } from '../utils/validators';
import { CreateTransactionDTO } from '../types';

export class TransactionController {
  
  static async getAll(req: Request, res: Response) {
    try {
const db = await DatabaseSingleton.getInstance();
      const { type, category, startDate, endDate } = req.query;
      
      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];
      
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY date DESC';
      
      const transactions = await db.all(query, params);
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ success: false, error: 'Error al obtener transacciones' });
    }
  }
  
  static async create(req: Request, res: Response) {
    try {
      const transactionData: CreateTransactionDTO = req.body;
      
      // Validar datos
      const errors = validateTransaction(transactionData);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }
      
      // Validar categoría
      if (!validCategories.includes(transactionData.category)) {
        return res.status(400).json({ 
          success: false, 
          error: `Categoría inválida. Categorías válidas: ${validCategories.join(', ')}` 
        });
      }
      
const db = await DatabaseSingleton.getInstance();
      const id = uuidv4();
      const date = transactionData.date || new Date().toISOString();
      
      await db.run(
        `INSERT INTO transactions (id, description, amount, type, category, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        transactionData.description,
        transactionData.amount,
        transactionData.type,
        transactionData.category,
        date
      );
      
      const newTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', id);
      
      res.status(201).json({ success: true, data: newTransaction });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ success: false, error: 'Error al crear transacción' });
    }
  }
  
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
const db = await DatabaseSingleton.getInstance();
      
      // Verificar que existe
      const existing = await db.get('SELECT * FROM transactions WHERE id = ?', id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Transacción no encontrada' });
      }
      
      // Construir query de actualización dinámica
      const allowedFields = ['description', 'amount', 'type', 'category', 'date'];
      const fieldsToUpdate = Object.keys(updates).filter(k => allowedFields.includes(k));
      
      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ success: false, error: 'No hay campos válidos para actualizar' });
      }
      
      const setClause = fieldsToUpdate.map(f => `${f} = ?`).join(', ');
      const values = fieldsToUpdate.map(f => updates[f]);
      values.push(id);
      
      await db.run(`UPDATE transactions SET ${setClause} WHERE id = ?`, values);
      
      const updated = await db.get('SELECT * FROM transactions WHERE id = ?', id);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar transacción' });
    }
  }
  
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
const db = await DatabaseSingleton.getInstance();
      
      const existing = await db.get('SELECT * FROM transactions WHERE id = ?', id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Transacción no encontrada' });
      }
      
      await db.run('DELETE FROM transactions WHERE id = ?', id);
      res.json({ success: true, message: 'Transacción eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar transacción' });
    }
  }
  
  static async getSummary(req: Request, res: Response) {
    try {
const db = await DatabaseSingleton.getInstance();
      
      const totalIncome = await db.get(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
      );
      
      const totalExpenses = await db.get(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
      );
      
      const byCategory = await db.all(
        `SELECT category, type, COALESCE(SUM(amount), 0) as total 
         FROM transactions 
         GROUP BY category, type`
      );
      
      res.json({
        success: true,
        data: {
          totalIncome: totalIncome.total,
          totalExpenses: totalExpenses.total,
          balance: totalIncome.total - totalExpenses.total,
          byCategory
        }
      });
    } catch (error) {
      console.error('Error getting summary:', error);
      res.status(500).json({ success: false, error: 'Error al obtener resumen' });
    }
  }
}