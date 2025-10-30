import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, clienteAPI, pedidoAPI, productoAPI, visitaAPI, vendedorAPI } from '../../api/api';

// ==================== DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    pedidosHoy: 0,
    ventasMes: 0,
    misClientes: 0,
    misPedidosHoy: 0,
    visitasPendientes: 0,
    productosStockBajo: 0,
    totalVendedores: 0,
    totalPedidos: 0,
    pedidosPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [visitasProximas, setVisitasProximas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.rol === 'administrador') {
        await fetchAdminStats();
      } else if (user?.rol === 'vendedor') {
        await fetchVendedorStats();
      } else if (user?.rol === 'auxiliar_administrativo') {
        await fetchAuxiliarStats();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      let usuarios = [], clientes = [], pedidos = [], productos = [], vendedores = [];

      try {
        const usuariosRes = await authAPI.getAllUsers();
        usuarios = usuariosRes.data.data.usuarios || [];
      } catch (error) { console.error('Error usuarios:', error); }

      try {
        const clientesRes = await clienteAPI.getAll();
        clientes = clientesRes.data.data.clientes || [];
      } catch (error) { console.error('Error clientes:', error); }

      try {
        const pedidosRes = await pedidoAPI.getAll();
        pedidos = pedidosRes.data.data.pedidos || [];
      } catch (error) { console.error('Error pedidos:', error); }

      try {
        const productosRes = await productoAPI.getStockBajo();
        productos = productosRes.data.data.productos || [];
      } catch (error) { console.error('Error productos:', error); }

      try {
        const vendedoresRes = await vendedorAPI.getAll();
        vendedores = vendedoresRes.data.data.vendedores || [];
      } catch (error) { console.error('Error vendedores:', error); }

      const hoy = new Date().toISOString().split('T')[0];
      const pedidosHoy = pedidos.filter(p => p.fecha_pedido.split('T')[0] === hoy);

      const mesActual = new Date().getMonth();
      const añoActual = new Date().getFullYear();
      const ventasMes = pedidos
        .filter(p => {
          const fechaPedido = new Date(p.fecha_pedido);
          return fechaPedido.getMonth() === mesActual && 
                 fechaPedido.getFullYear() === añoActual &&
                 p.estado !== 'anulado';
        })
        .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

      const recientes = pedidos
        .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
        .slice(0, 5);

      setStats({
        totalUsuarios: usuarios.length,
        totalClientes: clientes.length,
        pedidosHoy: pedidosHoy.length,
        ventasMes: ventasMes,
        productosStockBajo: productos.length,
        totalVendedores: vendedores.length,
        totalPedidos: pedidos.length
      });

      setPedidosRecientes(recientes);
    } catch (error) {
      console.error('Error en fetchAdminStats:', error);
    }
  };

  const fetchVendedorStats = async () => {
    try {
      let clientes = [], pedidos = [], visitas = [];

      try {
        const clientesRes = await clienteAPI.getMisClientes();
        clientes = clientesRes.data.data.clientes || [];
      } catch (error) { console.error('Error mis clientes:', error); }

      try {
        const pedidosRes = await pedidoAPI.getMisPedidos();
        pedidos = pedidosRes.data.data.pedidos || [];
      } catch (error) { console.error('Error mis pedidos:', error); }

      try {
        const visitasRes = await visitaAPI.getMisVisitas();
        visitas = visitasRes.data.data.visitas || [];
      } catch (error) { console.error('Error mis visitas:', error); }

      const hoy = new Date().toISOString().split('T')[0];
      const pedidosHoy = pedidos.filter(p => p.fecha_pedido.split('T')[0] === hoy);

      const visitasPendientes = visitas.filter(v => v.estado === 'programada');

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 7);
      const proximasVisitas = visitasPendientes
        .filter(v => new Date(v.fecha_visita) <= fechaLimite)
        .sort((a, b) => new Date(a.fecha_visita) - new Date(b.fecha_visita))
        .slice(0, 5);

      const recientes = pedidos
        .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
        .slice(0, 5);

      setStats({
        misClientes: clientes.length,
        misPedidosHoy: pedidosHoy.length,
        visitasPendientes: visitasPendientes.length
      });

      setPedidosRecientes(recientes);
      setVisitasProximas(proximasVisitas);
    } catch (error) {
      console.error('Error en fetchVendedorStats:', error);
    }
  };

  const fetchAuxiliarStats = async () => {
    try {
      let pedidos = [];

      try {
        const pedidosRes = await pedidoAPI.getAll();
        pedidos = pedidosRes.data.data.pedidos || [];
      } catch (error) { console.error('Error pedidos:', error); }

      const hoy = new Date().toISOString().split('T')[0];
      const pedidosHoy = pedidos.filter(p => p.fecha_pedido.split('T')[0] === hoy);

      const pedidosPendientes = pedidos.filter(p => 
        p.estado === 'registrado' || p.estado === 'confirmado'
      );

      const recientes = pedidos
        .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
        .slice(0, 5);

      setStats({
        totalPedidos: pedidos.length,
        pedidosHoy: pedidosHoy.length,
        pedidosPendientes: pedidosPendientes.length
      });

      setPedidosRecientes(recientes);
    } catch (error) {
      console.error('Error en fetchAuxiliarStats:', error);
    }
  };

  const getWelcomeMessage = () => {
    switch(user?.rol) {
      case 'administrador': return 'Panel de Administración';
      case 'vendedor': return 'Panel de Vendedor';
      case 'auxiliar_administrativo': return 'Panel de Auxiliar Administrativo';
      default: return 'Dashboard';
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'registrado': { bg: '#fff3cd', color: '#856404', text: 'Registrado' },
      'confirmado': { bg: '#cfe2ff', color: '#084298', text: 'Confirmado' },
      'entregado': { bg: '#d4edda', color: '#155724', text: 'Entregado' },
      'anulado': { bg: '#f8d7da', color: '#721c24', text: 'Anulado' },
      'programada': { bg: '#e7f3ff', color: '#0066cc', text: 'Programada' }
    };
    return badges[estado] || badges['registrado'];
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: '#3498db',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '5px' }}>
          Bienvenido, {user?.nombre}
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
          {getWelcomeMessage()}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {user?.rol === 'administrador' && (
          <>
            <StatCard icon="👥" title="Total Usuarios" value={stats.totalUsuarios} detail={`${stats.totalVendedores} vendedores`} />
            <StatCard icon="🏢" title="Total Clientes" value={stats.totalClientes} detail="Clientes activos" />
            <StatCard icon="📦" title="Pedidos Hoy" value={stats.pedidosHoy} detail={`${stats.totalPedidos} totales`} />
            <StatCard icon="💰" title="Ventas del Mes" value={`S/ ${stats.ventasMes.toFixed(2)}`} detail="Ventas confirmadas" />
            <StatCard icon="⚠️" title="Stock Bajo" value={stats.productosStockBajo} detail="Productos mínimos" />
          </>
        )}

        {user?.rol === 'vendedor' && (
          <>
            <StatCard icon="🏢" title="Mis Clientes" value={stats.misClientes} detail="Asignados" />
            <StatCard icon="📦" title="Mis Pedidos Hoy" value={stats.misPedidosHoy} detail="Registrados hoy" />
            <StatCard icon="📅" title="Visitas Pendientes" value={stats.visitasPendientes} detail="Programadas" />
          </>
        )}

        {user?.rol === 'auxiliar_administrativo' && (
          <>
            <StatCard icon="📦" title="Total Pedidos" value={stats.totalPedidos} detail="Registrados" />
            <StatCard icon="🕐" title="Pedidos Pendientes" value={stats.pedidosPendientes} detail="Por procesar" />
            <StatCard icon="✅" title="Pedidos Hoy" value={stats.pedidosHoy} detail="Registrados hoy" />
          </>
        )}
      </div>

      {pedidosRecientes.length > 0 && (
        <TableSection title="📦 Pedidos Recientes">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>ID</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Cliente</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Fecha</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Total</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRecientes.map(pedido => {
                const badge = getEstadoBadge(pedido.estado);
                return (
                  <tr key={pedido.id_pedido} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px 12px' }}>#{pedido.id_pedido}</td>
                    <td style={{ padding: '15px 12px' }}>{pedido.nombre_negocio}</td>
                    <td style={{ padding: '15px 12px' }}>{formatFecha(pedido.fecha_pedido)}</td>
                    <td style={{ padding: '15px 12px', fontWeight: 'bold', color: '#27ae60' }}>
                      S/ {parseFloat(pedido.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <span style={{
                        display: 'inline-block', padding: '5px 12px', borderRadius: '15px',
                        fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color
                      }}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableSection>
      )}

      {user?.rol === 'vendedor' && visitasProximas.length > 0 && (
        <TableSection title="📅 Próximas Visitas (Esta Semana)">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Cliente</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Fecha y Hora</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Tipo</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visitasProximas.map(visita => {
                const badge = getEstadoBadge(visita.estado);
                return (
                  <tr key={visita.id_visita} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px 12px' }}>{visita.nombre_negocio}</td>
                    <td style={{ padding: '15px 12px' }}>{formatFechaHora(visita.fecha_visita)}</td>
                    <td style={{ padding: '15px 12px' }}>{visita.tipo_visita}</td>
                    <td style={{ padding: '15px 12px' }}>
                      <span style={{
                        display: 'inline-block', padding: '5px 12px', borderRadius: '15px',
                        fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color
                      }}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableSection>
      )}

      <ActionSection user={user} />
    </div>
  );
};

// ==================== COMPONENTES AUXILIARES ====================
const StatCard = ({ icon, title, value, detail }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        background: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        fontSize: '40px',
        background: '#f0f0f0',
        width: '70px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ color: '#7f8c8d', fontSize: '14px', margin: '0 0 5px 0' }}>
          {title}
        </h3>
        <p style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '700', margin: '0 0 5px 0' }}>
          {value}
        </p>
        <span style={{ color: '#95a5a6', fontSize: '12px' }}>{detail}</span>
      </div>
    </div>
  );
};

const TableSection = ({ title, children }) => (
  <div style={{
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  }}>
    <h2 style={{ color: '#2c3e50', fontSize: '20px', margin: '0 0 20px 0' }}>
      {title}
    </h2>
    {children}
  </div>
);

const ActionSection = ({ user }) => (
  <div style={{
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <h3 style={{ color: '#2c3e50', fontSize: '18px', margin: '0 0 20px 0' }}>
      🎯 Acciones Rápidas
    </h3>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {user?.rol === 'administrador' && (
        <>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Registrar nuevo usuario</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Asignar clientes a vendedores</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Gestionar productos y stock</li>
          <li style={{ padding: '12px 0', color: '#555' }}>▸ Ver reportes de ventas</li>
        </>
      )}
      {user?.rol === 'vendedor' && (
        <>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Registrar nuevo pedido</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Programar visita a cliente</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Ver mis clientes asignados</li>
          <li style={{ padding: '12px 0', color: '#555' }}>▸ Consultar stock de productos</li>
        </>
      )}
      {user?.rol === 'auxiliar_administrativo' && (
        <>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Ver lista de pedidos</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>▸ Consultar stock</li>
          <li style={{ padding: '12px 0', color: '#555' }}>▸ Ver reportes</li>
        </>
      )}
    </ul>
  </div>
);

export default Dashboard;