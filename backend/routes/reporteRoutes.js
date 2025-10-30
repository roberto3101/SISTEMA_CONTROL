import express from 'express';
import reporteController from '../controllers/reporteController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y permiso de reportes
router.get('/ventas-periodo', authorize('administrador', 'auxiliar_administrativo'), reporteController.getVentasPorPeriodo);
router.get('/ventas-vendedor', authorize('administrador'), reporteController.getVentasPorVendedor);
router.get('/productos-vendidos', authorize('administrador', 'auxiliar_administrativo'), reporteController.getProductosMasVendidos);
router.get('/clientes', authorize('administrador'), reporteController.getReporteClientes);
router.get('/boletas', authorize('administrador', 'auxiliar_administrativo'), reporteController.getReporteBoletas);

export default router;