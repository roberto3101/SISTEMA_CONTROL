import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';

// Importar páginas
import RegistrarUsuario from './pages/Usuarios/RegistrarUsuario/RegistrarUsuario';
import ListaUsuarios from './pages/Usuarios/ListaUsuarios/ListaUsuarios';
import ListaClientes from './pages/Clientes/ListaClientes/ListaClientes';
import AsignarClientes from './pages/Clientes/AsignarClientes/AsignarClientes';
import RegistrarPedido from './pages/Pedidos/RegistrarPedido/RegistrarPedido';
import ListaPedidos from './pages/Pedidos/ListaPedidos/ListaPedidos';
import ConsultarStock from './pages/Productos/ConsultarStock/ConsultarStock';
import GestionarProductos from './pages/Productos/GestionarProductos/GestionarProductos';
import RegistrarVisita from './pages/Visitas/RegistrarVisita/RegistrarVisita';
import MisVisitas from './pages/Visitas/MisVisitas/MisVisitas';
import ReporteVentas from './pages/Reportes/ReporteVentas/ReporteVentas';
import GestionarVendedores from './pages/Vendedores/GestionarVendedores/GestionarVendedores';
import GenerarBoleta from './pages/Boletas/GenerarBoleta/GenerarBoleta';
import ListaBoletas from './pages/Boletas/ListaBoletas/ListaBoletas';
import styles from './App.module.css';

// Layout principal con Sidebar y Navbar
const MainLayout = ({ children }) => {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Navbar />
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Usuarios (Solo Administrador) */}
          <Route
            path="/usuarios/registrar"
            element={
              <ProtectedRoute requiredPermission="registrar_usuario">
                <MainLayout>
                  <RegistrarUsuario />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/usuarios/lista"
            element={
              <ProtectedRoute requiredPermission="registrar_usuario">
                <MainLayout>
                  <ListaUsuarios />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Clientes */}
          <Route
            path="/clientes/lista"
            element={
              <ProtectedRoute requiredPermission="mantener_cliente">
                <MainLayout>
                  <ListaClientes />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes/asignar"
            element={
              <ProtectedRoute requiredPermission="mantener_cliente">
                <MainLayout>
                  <AsignarClientes />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Visitas */}
          <Route
            path="/visitas/registrar"
            element={
              <ProtectedRoute requiredPermission="registrar_visita">
                <MainLayout>
                  <RegistrarVisita />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visitas/mis-visitas"
            element={
              <ProtectedRoute requiredPermission="registrar_visita">
                <MainLayout>
                  <MisVisitas />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Pedidos */}
          <Route
            path="/pedidos/registrar"
            element={
              <ProtectedRoute requiredPermission="registrar_pedido">
                <MainLayout>
                  <RegistrarPedido />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pedidos/lista"
            element={
              <ProtectedRoute requiredPermission="buscar_pedido">
                <MainLayout>
                  <ListaPedidos />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Productos */}
          <Route
            path="/productos/stock"
            element={
              <ProtectedRoute requiredPermission="buscar_producto">
                <MainLayout>
                  <ConsultarStock />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/productos/gestionar"
            element={
              <ProtectedRoute requiredPermission="mantener_productos">
                <MainLayout>
                  <GestionarProductos />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Vendedores */}
          <Route
            path="/vendedores/gestionar"
            element={
              <ProtectedRoute requiredPermission="buscar_vendedor">
                <MainLayout>
                  <GestionarVendedores />
                </MainLayout>
              </ProtectedRoute>
            }
          />


          {/* Rutas de Boletas */}
          <Route
            path="/boletas/generar"
            element={
              <ProtectedRoute requiredPermission="registrar_boleta">
                <MainLayout>
                  <GenerarBoleta />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/boletas/lista"
            element={
              <ProtectedRoute requiredPermission="ver_boletas">
                <MainLayout>
                  <ListaBoletas />
                </MainLayout>
              </ProtectedRoute>
            }
          />



          {/* Ruta de Reportes */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute requiredPermission="ver_reportes">
                <MainLayout>
                  <ReporteVentas />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;