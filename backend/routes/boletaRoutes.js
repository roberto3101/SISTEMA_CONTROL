import express from 'express';
import boletaController from '../controllers/boletaController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas
router.get('/', verifyToken, boletaController.getAll);
router.get('/:id', verifyToken, boletaController.getById);

// Generar boleta (Admin, Auxiliar Y VENDEDOR) ✅ AGREGADO 'vendedor'
router.post('/generar', authorize('administrador', 'auxiliar_administrativo', 'vendedor'), boletaController.generateFromPedido);

// Emitir boleta (Admin y Auxiliar)
router.put('/:id/emitir', authorize('administrador', 'auxiliar_administrativo'), boletaController.emitir);

// Anular boleta (Solo Admin y Auxiliar)
router.put('/:id/anular', authorize('administrador', 'auxiliar_administrativo'), boletaController.anular);

export default router;