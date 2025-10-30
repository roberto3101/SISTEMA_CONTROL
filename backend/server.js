import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import asignacionRoutes from './routes/asignacionRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import visitaRoutes from './routes/visitaRoutes.js'; // 🆕 AGREGAR
import vendedorRoutes from './routes/vendedorRoutes.js'; // 🆕 AGREGAR
import boletaRoutes from './routes/boletaRoutes.js'; // 🆕 AGREGAR
import reporteRoutes from './routes/reporteRoutes.js'; // 🆕




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/visitas', visitaRoutes); // 🆕 AGREGAR
app.use('/api/vendedores', vendedorRoutes); // 🆕 AGREGAR
app.use('/api/boletas', boletaRoutes); // 🆕 AGREGAR
app.use('/api/reportes', reporteRoutes); // 🆕




// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});