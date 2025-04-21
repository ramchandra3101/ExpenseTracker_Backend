import express from 'express';
import { 
  getAllPaymentMethods, 
  getPaymentMethodById, 
  createPaymentmethod, 
  updatePaymentMethod, 
  deletePaymentMethod 
} from '../controllers/paymentMethodController.js';

const router = express.Router();

// Routes
router.get('/', getAllPaymentMethods);
router.get('/:id', getPaymentMethodById);
router.post('/', createPaymentmethod);
router.put('/:id', updatePaymentMethod);
router.delete('/:id', deletePaymentMethod);

export default router;