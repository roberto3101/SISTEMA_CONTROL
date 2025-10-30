import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { pedidoAPI } from '../../../api/api';
import styles from './ListaPedidos.module.css';

const ListaPedidos = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [searchTerm, filtroEstado, pedidos]);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = user?.rol === 'vendedor' 
        ? await pedidoAPI.getMisPedidos() 
        : await pedidoAPI.getAll();
      
      if (response.data.success) {
        setPedidos(response.data.data.pedidos);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    let filtered = pedidos;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id_pedido.toString().includes(searchTerm)
      );
    }

    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(p => p.estado === filtroEstado);
    }

    setPedidosFiltrados(filtered);
  };

  const handleVerDetalle = async (pedidoId) => {
    try {
      const response = await pedidoAPI.getById(pedidoId);
      if (response.data.success) {
        setPedidoDetalle(response.data.data.pedido);
        setShowModal(true);
      }
    } catch (error) {
      setError('Error al cargar detalle del pedido');
    }
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado del pedido a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      await pedidoAPI.updateEstado(pedidoId, nuevoEstado);
      setSuccess('Estado actualizado exitosamente');
      await fetchPedidos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPedidoDetalle(null);
  };

  const getEstadoBadgeClass = (estado) => {
    const classes = {
      'registrado': styles.badgeRegistrado,
      'confirmado': styles.badgeConfirmado,
      'entregado': styles.badgeEntregado,
      'anulado': styles.badgeAnulado
    };
    return classes[estado] || styles.badgeRegistrado;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'registrado': 'Registrado',
      'confirmado': 'Confirmado',
      'entregado': 'Entregado',
      'anulado': 'Anulado'
    };
    return labels[estado] || estado;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Lista de Pedidos</h1>
          <p>Consulta y gestiona los pedidos registrados en el sistema</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      {/* Estadísticas */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Pedidos</span>
            <span className={styles.statValue}>{pedidos.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Registrados</span>
            <span className={styles.statValue}>
              {pedidos.filter(p => p.estado === 'registrado').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Confirmados</span>
            <span className={styles.statValue}>
              {pedidos.filter(p => p.estado === 'confirmado').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚚</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Entregados</span>
            <span className={styles.statValue}>
              {pedidos.filter(p => p.estado === 'entregado').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por cliente o número de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'todos' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'registrado' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('registrado')}
          >
            Registrados
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'confirmado' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('confirmado')}
          >
            Confirmados
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'entregado' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('entregado')}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Pedido</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  {searchTerm || filtroEstado !== 'todos' 
                    ? 'No se encontraron pedidos' 
                    : 'No hay pedidos registrados'}
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map(pedido => (
                <tr key={pedido.id_pedido}>
                  <td>
                    <span className={styles.pedidoId}>#{pedido.id_pedido}</span>
                  </td>
                  <td>
                    <div className={styles.clienteInfo}>
                      <strong>{pedido.nombre_negocio}</strong>
                      <span>{pedido.nombre_contacto}</span>
                    </div>
                  </td>
                  <td>{pedido.vendedor_nombre}</td>
                  <td>{formatFecha(pedido.fecha_pedido)}</td>
                  <td>
                    <span className={styles.total}>S/ {parseFloat(pedido.total).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getEstadoBadgeClass(pedido.estado)}`}>
                      {getEstadoLabel(pedido.estado)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnVer}
                        onClick={() => handleVerDetalle(pedido.id_pedido)}
                        title="Ver Detalle"
                      >
                        👁️
                      </button>
                      
                      {user?.rol === 'administrador' && pedido.estado !== 'anulado' && (
                        <>
                          {pedido.estado === 'registrado' && (
                            <button
                              className={styles.btnConfirmar}
                              onClick={() => handleCambiarEstado(pedido.id_pedido, 'confirmado')}
                              title="Confirmar"
                            >
                              ✅
                            </button>
                          )}
                          {pedido.estado === 'confirmado' && (
                            <button
                              className={styles.btnEntregar}
                              onClick={() => handleCambiarEstado(pedido.id_pedido, 'entregado')}
                              title="Marcar como Entregado"
                            >
                              🚚
                            </button>
                          )}
                          <button
                            className={styles.btnAnular}
                            onClick={() => handleCambiarEstado(pedido.id_pedido, 'anulado')}
                            title="Anular"
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      {showModal && pedidoDetalle && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalle del Pedido #{pedidoDetalle.id_pedido}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Información del Cliente</h3>
                <p><strong>Negocio:</strong> {pedidoDetalle.nombre_negocio}</p>
                <p><strong>Contacto:</strong> {pedidoDetalle.nombre_contacto}</p>
                <p><strong>Teléfono:</strong> {pedidoDetalle.telefono || 'Sin teléfono'}</p>
                <p><strong>Dirección:</strong> {pedidoDetalle.direccion || 'Sin dirección'}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Información del Pedido</h3>
                <p><strong>Vendedor:</strong> {pedidoDetalle.vendedor_nombre}</p>
                <p><strong>Fecha:</strong> {formatFecha(pedidoDetalle.fecha_pedido)}</p>
                <p><strong>Estado:</strong> <span className={`${styles.badge} ${getEstadoBadgeClass(pedidoDetalle.estado)}`}>
                  {getEstadoLabel(pedidoDetalle.estado)}
                </span></p>
                {pedidoDetalle.observaciones && (
                  <p><strong>Observaciones:</strong> {pedidoDetalle.observaciones}</p>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3>Productos</h3>
                <table className={styles.detalleTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoDetalle.detalles?.map(detalle => (
                      <tr key={detalle.id_detalle}>
                        <td>
                          <strong>{detalle.nombre}</strong>
                          <br />
                          <span className={styles.codigo}>{detalle.codigo}</span>
                        </td>
                        <td>{detalle.cantidad} {detalle.unidad_medida}</td>
                        <td>S/ {parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                        <td>S/ {parseFloat(detalle.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.totalesModal}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>S/ {parseFloat(pedidoDetalle.subtotal).toFixed(2)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>IGV (18%):</span>
                    <span>S/ {parseFloat(pedidoDetalle.igv).toFixed(2)}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>TOTAL:</span>
                    <span>S/ {parseFloat(pedidoDetalle.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaPedidos;