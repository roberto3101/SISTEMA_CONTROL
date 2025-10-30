import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { visitaAPI } from '../../../api/api';
import styles from './MisVisitas.module.css';

const MisVisitas = () => {
  const { user } = useAuth();
  const [visitas, setVisitas] = useState([]);
  const [visitasFiltradas, setVisitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState(null);
  const [resultado, setResultado] = useState('');

  useEffect(() => {
    fetchVisitas();
  }, []);

  useEffect(() => {
    filtrarVisitas();
  }, [searchTerm, filtroEstado, visitas]);

  const fetchVisitas = async () => {
    try {
      setLoading(true);
      const response = user?.rol === 'vendedor' 
        ? await visitaAPI.getMisVisitas() 
        : await visitaAPI.getAll();
      
      if (response.data.success) {
        setVisitas(response.data.data.visitas);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar visitas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarVisitas = () => {
    let filtered = visitas;

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(v => v.estado === filtroEstado);
    }

    setVisitasFiltradas(filtered);
  };

  const handleCambiarEstado = async (visita, nuevoEstado) => {
    setVisitaSeleccionada(visita);
    setShowModal(true);

    if (nuevoEstado === 'cancelada') {
      // Cancelar directamente sin resultado
      try {
        await visitaAPI.updateEstado(visita.id_visita, nuevoEstado, null);
        setSuccess('Visita cancelada exitosamente');
        await fetchVisitas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error al cancelar visita');
      }
      setShowModal(false);
    }
  };

  const handleGuardarResultado = async () => {
    if (!resultado.trim()) {
      setError('Debe ingresar un resultado de la visita');
      return;
    }

    try {
      await visitaAPI.updateEstado(visitaSeleccionada.id_visita, 'realizada', resultado);
      setSuccess('Visita marcada como realizada');
      setShowModal(false);
      setResultado('');
      await fetchVisitas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al actualizar visita');
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const classes = {
      'programada': styles.badgeProgramada,
      'realizada': styles.badgeRealizada,
      'cancelada': styles.badgeCancelada
    };
    return classes[estado] || styles.badgeProgramada;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'programada': 'Programada',
      'realizada': 'Realizada',
      'cancelada': 'Cancelada'
    };
    return labels[estado] || estado;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'prospeccion': 'Prospección',
      'seguimiento': 'Seguimiento',
      'entrega': 'Entrega',
      'cobranza': 'Cobranza',
      'otro': 'Otro'
    };
    return labels[tipo] || tipo;
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
        <div className={styles.loading}>Cargando visitas...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Mis Visitas</h1>
          <p>Gestiona tus visitas programadas y realizadas</p>
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
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Visitas</span>
            <span className={styles.statValue}>{visitas.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🕐</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Programadas</span>
            <span className={styles.statValue}>
              {visitas.filter(v => v.estado === 'programada').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Realizadas</span>
            <span className={styles.statValue}>
              {visitas.filter(v => v.estado === 'realizada').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Canceladas</span>
            <span className={styles.statValue}>
              {visitas.filter(v => v.estado === 'cancelada').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por cliente..."
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
            className={`${styles.filterBtn} ${filtroEstado === 'programada' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('programada')}
          >
            Programadas
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'realizada' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('realizada')}
          >
            Realizadas
          </button>
          <button
            className={`${styles.filterBtn} ${filtroEstado === 'cancelada' ? styles.active : ''}`}
            onClick={() => setFiltroEstado('cancelada')}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Grid de Visitas */}
      <div className={styles.visitasGrid}>
        {visitasFiltradas.length === 0 ? (
          <div className={styles.noData}>
            {searchTerm || filtroEstado !== 'todos' 
              ? 'No se encontraron visitas' 
              : 'No hay visitas registradas'}
          </div>
        ) : (
          visitasFiltradas.map(visita => (
            <div key={visita.id_visita} className={styles.visitaCard}>
              <div className={styles.visitaHeader}>
                <span className={`${styles.badge} ${getEstadoBadgeClass(visita.estado)}`}>
                  {getEstadoLabel(visita.estado)}
                </span>
                <span className={styles.tipoBadge}>
                  {getTipoLabel(visita.tipo_visita)}
                </span>
              </div>

              <div className={styles.visitaBody}>
                <div className={styles.clienteInfo}>
                  <h3>{visita.nombre_negocio}</h3>
                  <p>{visita.nombre_contacto}</p>
                </div>

                <div className={styles.visitaDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📅</span>
                    <span>{formatFecha(visita.fecha_visita)}</span>
                  </div>
                  {visita.telefono && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📞</span>
                      <span>{visita.telefono}</span>
                    </div>
                  )}
                  {visita.direccion && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📍</span>
                      <span>{visita.direccion}</span>
                    </div>
                  )}
                </div>

                {visita.observaciones && (
                  <div className={styles.observaciones}>
                    <strong>Observaciones:</strong>
                    <p>{visita.observaciones}</p>
                  </div>
                )}

                {visita.resultado && (
                  <div className={styles.resultado}>
                    <strong>Resultado:</strong>
                    <p>{visita.resultado}</p>
                  </div>
                )}
              </div>

              {visita.estado === 'programada' && (
                <div className={styles.visitaFooter}>
                  <button
                    className={styles.btnRealizada}
                    onClick={() => handleCambiarEstado(visita, 'realizada')}
                  >
                    ✅ Marcar Realizada
                  </button>
                  <button
                    className={styles.btnCancelar}
                    onClick={() => {
                      if (window.confirm('¿Cancelar esta visita?')) {
                        handleCambiarEstado(visita, 'cancelada');
                      }
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para resultado de visita */}
      {showModal && visitaSeleccionada && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Resultado de la Visita</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalInfo}>
                <strong>Cliente:</strong> {visitaSeleccionada.nombre_negocio}
              </p>
              <p className={styles.modalInfo}>
                <strong>Fecha:</strong> {formatFecha(visitaSeleccionada.fecha_visita)}
              </p>

              <div className={styles.formGroup}>
                <label>Resultado de la visita *</label>
                <textarea
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="Describa qué ocurrió en la visita, acuerdos alcanzados, etc."
                  rows={5}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary} 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnPrimary} 
                onClick={handleGuardarResultado}
              >
                Guardar Resultado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisVisitas;