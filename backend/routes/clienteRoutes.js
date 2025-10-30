import express from 'express';
import clienteController from '../controllers/clienteController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas - Admin y Vendedores
router.get('/', verifyToken, clienteController.getAll);
router.get('/search', verifyToken, clienteController.search);
router.get('/mis-clientes', authorize('vendedor'), clienteController.getMisClientes);
router.get('/:id', verifyToken, clienteController.getById);

// Rutas protegidas - Solo Admin
router.post('/', authorize('administrador'), clienteController.create);
router.put('/:id', authorize('administrador'), clienteController.update);
router.delete('/:id', authorize('administrador'), clienteController.delete);

export default router;