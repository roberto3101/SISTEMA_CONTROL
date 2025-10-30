import express from 'express';
import pedidoController from '../controllers/pedidoController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas - Admin y Vendedores
router.get('/', verifyToken, pedidoController.getAll);
router.get('/mis-pedidos', verifyToken, pedidoController.getMisPedidos);
router.get('/:id', verifyToken, pedidoController.getById);

// Crear pedido (Admin y Vendedores)
router.post('/', authorize('administrador', 'vendedor'), pedidoController.create);

// Actualizar estado (Solo Admin)
router.put('/:id/estado', authorize('administrador'), pedidoController.updateEstado);

export default router;