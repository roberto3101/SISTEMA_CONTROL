import { useState, useEffect } from 'react';
import { boletaAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './ListaBoletas.module.css';

const ListaBoletas = () => {
  const { user } = useAuth();
  const [boletas, setboletas] = useState([]);
  const [boletasFiltradas, setboletasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'emitir' o 'anular'
  const [selectedBoleta, setSelectedBoleta] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchboletas();
  }, []);

  useEffect(() => {
    filtrarboletas();
  }, [searchTerm, filtroEstado, boletas]);

  const fetchboletas = async () => {
    try {
      setLoading(true);
      const response = await boletaAPI.getAll();
      
      if (response.data.success) {
        setboletas(response.data.data.boletas);
      }
    } catch (error) {
      setError('Error al cargar boletas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarboletas = () => {
    let filtered = boletas;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.numero_boleta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id_pedido.toString().includes(searchTerm)
      );
    }

    if (filtroEstado !== 'todas') {
      filtered = filtered.filter(b => b.estado === filtroEstado);
    }

    setboletasFiltradas(filtered);
  };

  const handleOpenModal = (boleta, type) => {
    setSelectedBoleta(boleta);
    setModalType(type);
    setShowModal(true);
    setMotivoAnulacion('');
    setError('');
  };

  const handleEmitir = async () => {
    try {
      setProcessing(true);
      setError('');

      await boletaAPI.emitir(selectedBoleta.id_boleta);
      
      setSuccess(`Boleta ${selectedBoleta.numero_boleta} emitida exitosamente`);
      setShowModal(false);
      await fetchboletas();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al emitir boleta');
    } finally {
      setProcessing(false);
    }
  };

  const handleAnular = async () => {
    if (!motivoAnulacion.trim()) {
      setError('Debe ingresar un motivo de anulación');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      await boletaAPI.anular(selectedBoleta.id_boleta, motivoAnulacion);
      
      setSuccess(`Boleta ${selectedBoleta.numero_boleta} anulada exitosamente`);
      setShowModal(false);
      await fetchboletas();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al anular boleta');
    } finally {
      setProcessing(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'registrada': { class: styles.badgeRegistrada, text: 'Registrada' },
      'emitida': { class: styles.badgeEmitida, text: 'Emitida' },
      'anulada': { class: styles.badgeAnulada, text: 'Anulada' }
    };
    return badges[estado] || badges['registrada'];
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEmitir = (boleta) => {
    return boleta.estado === 'registrada' && 
           (user?.rol === 'administrador' || user?.rol === 'auxiliar_administrativo');
  };

  const canAnular = (boleta) => {
    return (boleta.estado === 'registrada' || boleta.estado === 'emitida') &&
           (user?.rol === 'administrador' || user?.rol === 'auxiliar_administrativo');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando boletas...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Lista de Boletas</h1>
          <p>Gestiona las boletas de venta registradas</p>
        </div>
      </div>

      {error && !showModal && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      {/* Estadísticas */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Boletas</span>
            <span className={styles.statValue}>{boletas.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Registradas</span>
            <span className={styles.statValue}>
              {boletas.filter(b => b.estado === 'registrada').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Emitidas</span>
            <span className={styles.statValue}>
              {boletas.filter(b => b.estado === 'emitida').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Anuladas</span>
            <span className={styles.statValue}>
              {boletas.filter(b => b.estado === 'anulada').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por número de boleta, cliente o pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'todas' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'registrada' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('registrada')}
          >
            Registradas
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'emitida' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('emitida')}
          >
            Emitidas
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'anulada' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('anulada')}
          >
            Anuladas
          </button>
        </div>
      </div>

      {/* Tabla */}
      {boletasFiltradas.length === 0 ? (
        <div className={styles.noData}>
          {searchTerm || filtroEstado !== 'todas'
            ? 'No se encontraron boletas'
            : 'No hay boletas registradas'}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Boleta</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha Emisión</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {boletasFiltradas.map(boleta => (
                <tr key={boleta.id_boleta}>
                  <td className={styles.numeroBoleta}>{boleta.numero_boleta}</td>
                  <td>#{boleta.id_pedido}</td>
                  <td>{boleta.nombre_negocio}</td>
                  <td>{formatFecha(boleta.fecha_emision)}</td>
                  <td className={styles.totalAmount}>S/ {parseFloat(boleta.total).toFixed(2)}</td>
                  <td>
                    <span className={getEstadoBadge(boleta.estado).class}>
                      {getEstadoBadge(boleta.estado).text}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {canEmitir(boleta) && (
                        <button
                          className={styles.btnEmitir}
                          onClick={() => handleOpenModal(boleta, 'emitir')}
                          title="Emitir boleta"
                        >
                          📤
                        </button>
                      )}
                      {canAnular(boleta) && (
                        <button
                          className={styles.btnAnular}
                          onClick={() => handleOpenModal(boleta, 'anular')}
                          title="Anular boleta"
                        >
                          🚫
                        </button>
                      )}
                      {boleta.estado === 'anulada' && boleta.motivo_anulacion && (
                        <button
                          className={styles.btnInfo}
                          title={`Motivo: ${boleta.motivo_anulacion}`}
                        >
                          ℹ️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedBoleta && (
        <div className={styles.modalOverlay} onClick={() => !processing && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'emitir' ? 'Emitir Boleta' : 'Anular Boleta'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                disabled={processing}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.boletaInfo}>
                <p><strong>N° Boleta:</strong> {selectedBoleta.numero_boleta}</p>
                <p><strong>Cliente:</strong> {selectedBoleta.nombre_negocio}</p>
                <p><strong>Total:</strong> S/ {parseFloat(selectedBoleta.total).toFixed(2)}</p>
              </div>

              {modalType === 'emitir' ? (
                <div className={styles.warningBox}>
                  <span className={styles.warningIcon}>⚠️</span>
                  <p>¿Está seguro que desea emitir esta boleta?</p>
                </div>
              ) : (
                <>
                  <div className={styles.dangerBox}>
                    <span className={styles.dangerIcon}>🚫</span>
                    <p>¿Está seguro que desea anular esta boleta?</p>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Motivo de Anulación *</label>
                    <textarea
                      value={motivoAnulacion}
                      onChange={(e) => setMotivoAnulacion(e.target.value)}
                      placeholder="Ingrese el motivo por el cual se anula la boleta..."
                      rows={4}
                      disabled={processing}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowModal(false)}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className={modalType === 'emitir' ? styles.btnPrimary : styles.btnDanger}
                onClick={modalType === 'emitir' ? handleEmitir : handleAnular}
                disabled={processing}
              >
                {processing 
                  ? 'Procesando...' 
                  : (modalType === 'emitir' ? 'Emitir Boleta' : 'Anular Boleta')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaBoletas;