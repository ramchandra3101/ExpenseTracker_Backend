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
router.get('/getpaymethods', getAllPaymentMethods);
router.get('/getpaymethods/:id', getPaymentMethodById);
router.post('/createpaymentMethod', createPaymentmethod);
router.put('/:id', updatePaymentMethod);
router.delete('/:id', deletePaymentMethod);

export default router;