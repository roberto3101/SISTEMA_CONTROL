import express from 'express';
import productoController from '../controllers/productoController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas de consulta (todos los usuarios autenticados)
router.get('/', verifyToken, productoController.getAll);
router.get('/search', verifyToken, productoController.search);
router.get('/stock-bajo', verifyToken, productoController.getStockBajo);
router.get('/:id', verifyToken, productoController.getById);
router.post('/:id/verificar-stock', verifyToken, productoController.verificarStock);

// Rutas CRUD (solo administrador) - NUEVO
router.post('/', authorize('administrador'), productoController.create);
router.put('/:id', authorize('administrador'), productoController.update);
router.delete('/:id', authorize('administrador'), productoController.delete);

export default router;