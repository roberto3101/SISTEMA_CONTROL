import express from 'express';
import visitaController from '../controllers/visitaController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas para Admin y Vendedores
router.get('/', verifyToken, visitaController.getAll);
router.get('/mis-visitas', verifyToken, visitaController.getMisVisitas);
router.get('/cliente/:id', verifyToken, visitaController.getByCliente);
router.get('/:id', verifyToken, visitaController.getById);

// Crear visita (Admin y Vendedores)
router.post('/', authorize('administrador', 'vendedor'), visitaController.create);

// Actualizar visita
router.put('/:id', authorize('administrador', 'vendedor'), visitaController.update);

// Actualizar estado de visita
router.put('/:id/estado', authorize('administrador', 'vendedor'), visitaController.updateEstado);

// Eliminar visita (Solo Admin)
router.delete('/:id', authorize('administrador'), visitaController.delete);

export default router;