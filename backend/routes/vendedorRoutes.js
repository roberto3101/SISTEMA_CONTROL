import express from 'express';
import vendedorController from '../controllers/vendedorController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Solo Administradores pueden acceder a estas rutas
router.get('/', authorize('administrador'), vendedorController.getAll);
router.get('/estadisticas', authorize('administrador'), vendedorController.getEstadisticas);
router.get('/:id', authorize('administrador'), vendedorController.getById);
router.post('/', authorize('administrador'), vendedorController.create);
router.put('/:id', authorize('administrador'), vendedorController.update);
router.put('/:id/estado', authorize('administrador'), vendedorController.updateEstado);
router.delete('/:id', authorize('administrador'), vendedorController.delete);

export default router;