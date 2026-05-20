import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';

const router = Router();

// Rutas RESTful
router.get('/', TransactionController.getAll);
router.post('/', TransactionController.create);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);
router.get('/summary', TransactionController.getSummary);

export default router;