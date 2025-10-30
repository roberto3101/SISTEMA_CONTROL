import express from 'express';
import authController from '../controllers/authController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', verifyToken, authController.getProfile);

// Rutas protegidas por rol (solo administrador)
router.post('/register', authorize('administrador'), authController.register);
router.get('/users', authorize('administrador'), authController.getAllUsers); // 🆕 NUEVO

export default router;