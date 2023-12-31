import express from 'express';
import { addTransaction, deleteTransaction, editTransaction, filterCategory, getTransaction, getTransactions } from '../controllers/transaction.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, getTransactions);
router.post('/add', isAuthenticated, addTransaction);
router.route('/:id')
    .get(isAuthenticated, getTransaction)
    .put(isAuthenticated, editTransaction)
    .delete(isAuthenticated, deleteTransaction);

router.get('/category/:cate', isAuthenticated, filterCategory);

export default router;