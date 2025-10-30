import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  getAllUsers: () => api.get('/auth/users')
};

// Funciones de clientes
export const clienteAPI = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  search: (searchTerm) => api.get(`/clientes/search?q=${searchTerm}`),
  create: (clienteData) => api.post('/clientes', clienteData),
  update: (id, clienteData) => api.put(`/clientes/${id}`, clienteData),
  delete: (id) => api.delete(`/clientes/${id}`),
  getMisClientes: () => api.get('/clientes/mis-clientes')
};

// Funciones de asignaciones
export const asignacionAPI = {
  getAll: () => api.get('/asignaciones'),
  getClientesSinAsignar: () => api.get('/asignaciones/clientes-sin-asignar'),
  getVendedores: () => api.get('/asignaciones/vendedores'),
  asignar: (data) => api.post('/asignaciones/asignar', data),
  reasignar: (data) => api.put('/asignaciones/reasignar', data),
  quitar: (id) => api.delete(`/asignaciones/${id}`)
};

// Funciones de productos
export const productoAPI = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  search: (searchTerm) => api.get(`/productos/search?q=${searchTerm}`),
  getStockBajo: () => api.get('/productos/stock-bajo'),
  verificarStock: (id, cantidad) => api.post(`/productos/${id}/verificar-stock`, { cantidad }),
  create: (productoData) => api.post('/productos', productoData),
  update: (id, productoData) => api.put(`/productos/${id}`, productoData),
  delete: (id) => api.delete(`/productos/${id}`)
};

// Funciones de pedidos
export const pedidoAPI = {
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  getMisPedidos: () => api.get('/pedidos/mis-pedidos'),
  create: (pedidoData) => api.post('/pedidos', pedidoData),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado })
};








// Funciones de visitas
export const visitaAPI = {
  getAll: () => api.get('/visitas'),
  getById: (id) => api.get(`/visitas/${id}`),
  getMisVisitas: () => api.get('/visitas/mis-visitas'),
  getByCliente: (clienteId) => api.get(`/visitas/cliente/${clienteId}`),
  create: (visitaData) => api.post('/visitas', visitaData),
  update: (id, visitaData) => api.put(`/visitas/${id}`, visitaData),
  updateEstado: (id, estado, resultado) => api.put(`/visitas/${id}/estado`, { estado, resultado }),
  delete: (id) => api.delete(`/visitas/${id}`)
};




export const vendedorAPI = {
  getAll: () => api.get('/vendedores'),
  getById: (id) => api.get(`/vendedores/${id}`),
  getEstadisticas: () => api.get('/vendedores/estadisticas'),
  create: (vendedorData) => api.post('/vendedores', vendedorData),
  update: (id, vendedorData) => api.put(`/vendedores/${id}`, vendedorData),
  updateEstado: (id, estado) => api.put(`/vendedores/${id}/estado`, { estado }),
  delete: (id) => api.delete(`/vendedores/${id}`)
};





// Funciones de boletas
export const boletaAPI = {
  getAll: () => api.get('/boletas'),
  getById: (id) => api.get(`/boletas/${id}`),
  generateFromPedido: (id_pedido) => api.post('/boletas/generar', { id_pedido }),
  emitir: (id) => api.put(`/boletas/${id}/emitir`),
  anular: (id, motivo_anulacion) => api.put(`/boletas/${id}/anular`, { motivo_anulacion })
};



// Funciones de reportes
export const reporteAPI = {
  getVentasPorPeriodo: (fecha_inicio, fecha_fin) => 
    api.get(`/reportes/ventas-periodo?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`),
  getVentasPorVendedor: (fecha_inicio, fecha_fin) => 
    api.get(`/reportes/ventas-vendedor?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`),
  getProductosMasVendidos: (fecha_inicio, fecha_fin, limit = 10) => 
    api.get(`/reportes/productos-vendidos?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}&limit=${limit}`),
  getReporteClientes: () => 
    api.get('/reportes/clientes'),
  getReporteBoletas: (fecha_inicio, fecha_fin) => 
    api.get(`/reportes/boletas?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`)
};


export default api;