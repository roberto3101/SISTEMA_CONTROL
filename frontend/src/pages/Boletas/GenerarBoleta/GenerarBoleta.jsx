import { useState, useEffect } from 'react';
import { boletaAPI, pedidoAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './GenerarBoleta.module.css';

const GenerarBoleta = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingBoleta, setGeneratingBoleta] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

const fetchPedidos = async () => {
  try {
    setLoading(true);
    const response = await pedidoAPI.getAll();
    
    if (response.data.success) {
      // Filtrar pedidos que NO estén anulados y NO tengan boleta
      const pedidosSinBoleta = response.data.data.pedidos.filter(p => 
        p.estado !== 'anulado' && !p.tiene_boleta
      );
      setPedidos(pedidosSinBoleta);
    }
  } catch (error) {
    setError('Error al cargar pedidos');
  } finally {
    setLoading(false);
  }
};

  const handleGenerateBoleta = (pedido) => {
    setSelectedPedido(pedido);
    setShowModal(true);
  };

  const confirmGenerateBoleta = async () => {
    try {
      setGeneratingBoleta(true);
      setError('');

      const response = await boletaAPI.generateFromPedido(selectedPedido.id_pedido);

      if (response.data.success) {
        setSuccess(`Boleta ${response.data.data.boleta.numero_boleta} generada exitosamente`);
        setShowModal(false);
        await fetchPedidos();
        
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al generar boleta');
    } finally {
      setGeneratingBoleta(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(p =>
    p.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id_pedido.toString().includes(searchTerm)
  );

const getEstadoBadge = (estado) => {
  const badges = {
    'registrado': { class: styles.badgeRegistrado, text: 'Registrado' },
    'confirmado': { class: styles.badgeConfirmado, text: 'Confirmado' },
    'entregado': { class: styles.badgeEntregado, text: 'Entregado' }
  };
  return badges[estado] || badges['registrado'];
};

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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
          <h1>Generar Boleta de Venta</h1>
          <p>Selecciona un pedido para generar su boleta</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      <div className={styles.infoCard}>
        <span className={styles.infoIcon}>ℹ️</span>
        <div>
          <strong>Nota:</strong> Solo se muestran pedidos confirmados o entregados que aún no tienen boleta.
        </div>
      </div>

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

      {pedidosFiltrados.length === 0 ? (
        <div className={styles.noData}>
          {searchTerm 
            ? 'No se encontraron pedidos' 
            : 'No hay pedidos disponibles para generar boleta'}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido #</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id_pedido}>
                  <td>#{pedido.id_pedido}</td>
                  <td>{pedido.nombre_negocio}</td>
                  <td>{formatFecha(pedido.fecha_pedido)}</td>
                  <td>{pedido.vendedor_nombre}</td>
                  <td className={styles.totalAmount}>S/ {parseFloat(pedido.total).toFixed(2)}</td>
                  <td>
                    <span className={getEstadoBadge(pedido.estado).class}>
                      {getEstadoBadge(pedido.estado).text}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.btnGenerar}
                      onClick={() => handleGenerateBoleta(pedido)}
                    >
                      🧾 Generar Boleta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showModal && selectedPedido && (
        <div className={styles.modalOverlay} onClick={() => !generatingBoleta && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirmar Generación de Boleta</h2>
              <button 
                className={styles.modalClose} 
                onClick={() => setShowModal(false)}
                disabled={generatingBoleta}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.confirmInfo}>
                <p><strong>Pedido:</strong> #{selectedPedido.id_pedido}</p>
                <p><strong>Cliente:</strong> {selectedPedido.nombre_negocio}</p>
                <p><strong>Total:</strong> S/ {parseFloat(selectedPedido.total).toFixed(2)}</p>
              </div>

              <div className={styles.warningBox}>
                <span className={styles.warningIcon}>⚠️</span>
                <p>¿Está seguro que desea generar la boleta para este pedido?</p>
              </div>

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowModal(false)}
                disabled={generatingBoleta}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={confirmGenerateBoleta}
                disabled={generatingBoleta}
              >
                {generatingBoleta ? 'Generando...' : 'Generar Boleta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerarBoleta;