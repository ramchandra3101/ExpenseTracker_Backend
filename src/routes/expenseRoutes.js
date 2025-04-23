import express from 'express';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { scanReceipt } from '../controllers/receiptScanner.js';
import {previewReceipt} from '../controllers/receiptPreview.js';
import {upload} from '../services/storage.js';

const router = express.Router();

// Routes
router.get('/', getAllExpenses);
router.post('/create', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

router.post('/scan', upload.single('receipt'), scanReceipt);
router.post('/preview', upload.single('receipt'), previewReceipt);

export default router;