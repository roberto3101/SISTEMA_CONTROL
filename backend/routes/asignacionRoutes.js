import express from 'express';
import asignacionController from '../controllers/asignacionController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas son solo para administrador
router.get('/', authorize('administrador'), asignacionController.getAll);
router.get('/clientes-sin-asignar', authorize('administrador'), asignacionController.getClientesSinAsignar);
router.get('/vendedores', authorize('administrador'), asignacionController.getVendedores);
router.post('/asignar', authorize('administrador'), asignacionController.asignar);
router.put('/reasignar', authorize('administrador'), asignacionController.reasignar);
router.delete('/:id', authorize('administrador'), asignacionController.quitar);

export default router;