import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.get('/advice', AIController.getAdvice);
router.get('/prediction', AIController.getSpendingPrediction);

export default router;