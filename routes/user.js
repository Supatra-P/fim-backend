import express from 'express';
import { getMyProfile, login, logout, register, requestResetPassword, resetPassword } from '../controllers/user.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.get('/me', isAuthenticated, getMyProfile);

router.post('/request-reset-password', requestResetPassword);
router.post('/reset-password', resetPassword);

export default router;