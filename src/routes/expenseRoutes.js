import express from 'express';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

// Routes
router.get('/', getAllExpenses);
router.post('/create', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;