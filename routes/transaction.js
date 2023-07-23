import express from 'express';
import { addTransaction, deleteTransaction, editTransaction, getTransactions } from '../controllers/transaction.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, getTransactions);
router.post('/add', isAuthenticated, addTransaction);
router.route('/:id')
    .put(isAuthenticated, editTransaction)
    .delete(isAuthenticated, deleteTransaction);

export default router;