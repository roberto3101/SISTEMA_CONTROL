import { useState, useEffect } from 'react';
import { asignacionAPI } from '../../../api/api';
import styles from './AsignarClientes.module.css';

const AsignarClientes = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [clientesSinAsignar, setClientesSinAsignar] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    id_vendedor: '',
    id_cliente: ''
  });

  const [reasignarData, setReasignarData] = useState({
    id_asignacion: '',
    nuevo_id_vendedor: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [asignacionesRes, clientesRes, vendedoresRes] = await Promise.all([
        asignacionAPI.getAll(),
        asignacionAPI.getClientesSinAsignar(),
        asignacionAPI.getVendedores()
      ]);

      if (asignacionesRes.data.success) {
        setAsignaciones(asignacionesRes.data.data.asignaciones);
      }
      if (clientesRes.data.success) {
        setClientesSinAsignar(clientesRes.data.data.clientes);
      }
      if (vendedoresRes.data.success) {
        setVendedores(vendedoresRes.data.data.vendedores);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ id_vendedor: '', id_cliente: '' });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id_vendedor: '', id_cliente: '' });
  };

  const handleOpenReasignarModal = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setReasignarData({
      id_asignacion: asignacion.id_asignacion,
      nuevo_id_vendedor: ''
    });
    setShowReasignarModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseReasignarModal = () => {
    setShowReasignarModal(false);
    setSelectedAsignacion(null);
    setReasignarData({ id_asignacion: '', nuevo_id_vendedor: '' });
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await asignacionAPI.asignar(formData);
      
      if (response.data.success) {
        setSuccess('Cliente asignado exitosamente');
        await fetchData();
        setTimeout(() => {
          handleCloseModal();
          setSuccess('');
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al asignar cliente');
    }
  };

  const handleReasignar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await asignacionAPI.reasignar(reasignarData);
      
      if (response.data.success) {
        setSuccess('Cliente reasignado exitosamente');
        await fetchData();
        setTimeout(() => {
          handleCloseReasignarModal();
          setSuccess('');
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al reasignar cliente');
    }
  };

  const handleQuitar = async (id) => {
    if (!window.confirm('¿Está seguro de quitar esta asignación?')) {
      return;
    }

    try {
      await asignacionAPI.quitar(id);
      setSuccess('Asignación eliminada exitosamente');
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al quitar asignación');
    }
  };

  const asignacionesFiltradas = asignaciones.filter(asig =>
    asig.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asig.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asig.distrito && asig.distrito.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Asignar Clientes a Vendedores</h1>
          <p>Gestiona las asignaciones de clientes a vendedores</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={handleOpenModal}
          disabled={clientesSinAsignar.length === 0}
        >
          + Nueva Asignación
        </button>
      </div>

      {error && !showModal && !showReasignarModal && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && !showModal && !showReasignarModal && (
        <div className={styles.successMessage}>{success}</div>
      )}

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Clientes Asignados</span>
            <span className={styles.statValue}>{asignaciones.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Sin Asignar</span>
            <span className={styles.statValue}>{clientesSinAsignar.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚗</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Vendedores Activos</span>
            <span className={styles.statValue}>{vendedores.length}</span>
          </div>
        </div>
      </div>

      {/* Tabla de Vendedores con sus clientes */}
      <div className={styles.vendedoresSection}>
        <h2>Distribución por Vendedor</h2>
        <div className={styles.vendedoresGrid}>
          {vendedores.map(vendedor => {
            const clientesVendedor = asignaciones.filter(
              a => a.id_vendedor === vendedor.id_usuario
            );
            
            return (
              <div key={vendedor.id_usuario} className={styles.vendedorCard}>
                <div className={styles.vendedorHeader}>
                  <div className={styles.vendedorAvatar}>
                    {vendedor.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.vendedorInfo}>
                    <h3>{vendedor.nombre_completo}</h3>
                    <p>{vendedor.email}</p>
                  </div>
                  <div className={styles.vendedorBadge}>
                    {vendedor.total_clientes} clientes
                  </div>
                </div>
                
                {clientesVendedor.length > 0 ? (
                  <div className={styles.clientesList}>
                    {clientesVendedor.map(asig => (
                      <div key={asig.id_asignacion} className={styles.clienteItem}>
                        <div className={styles.clienteInfo}>
                          <strong>{asig.nombre_negocio}</strong>
                          <span className={styles.clienteDistrito}>
                            {asig.distrito || 'Sin distrito'}
                          </span>
                        </div>
                        <div className={styles.clienteActions}>
                          <button
                            className={styles.btnReasignar}
                            onClick={() => handleOpenReasignarModal(asig)}
                            title="Reasignar"
                          >
                            🔄
                          </button>
                          <button
                            className={styles.btnQuitar}
                            onClick={() => handleQuitar(asig.id_asignacion)}
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noClientes}>
                    Sin clientes asignados
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de todas las asignaciones */}
      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h2>Todas las Asignaciones</h2>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Distrito</th>
                <th>Vendedor</th>
                <th>Fecha Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    {searchTerm ? 'No se encontraron asignaciones' : 'No hay asignaciones'}
                  </td>
                </tr>
              ) : (
                asignacionesFiltradas.map(asig => (
                  <tr key={asig.id_asignacion}>
                    <td>
                      <strong>{asig.nombre_negocio}</strong>
                    </td>
                    <td>{asig.nombre_contacto}</td>
                    <td>{asig.distrito || '-'}</td>
                    <td>
                      <div className={styles.vendedorTag}>
                        {asig.vendedor_nombre}
                      </div>
                    </td>
                    <td>
                      {new Date(asig.fecha_asignacion).toLocaleDateString('es-PE')}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => handleOpenReasignarModal(asig)}
                          title="Reasignar"
                        >
                          🔄
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleQuitar(asig.id_asignacion)}
                          title="Quitar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nueva Asignación */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Asignación</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleAsignar}>
              <div className={styles.modalBody}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <div className={styles.formGroup}>
                  <label>Seleccionar Cliente *</label>
                  <select
                    value={formData.id_cliente}
                    onChange={(e) => setFormData({...formData, id_cliente: e.target.value})}
                    required
                  >
                    <option value="">-- Seleccione un cliente --</option>
                    {clientesSinAsignar.map(cliente => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre_negocio} - {cliente.distrito || 'Sin distrito'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Seleccionar Vendedor *</label>
                  <select
                    value={formData.id_vendedor}
                    onChange={(e) => setFormData({...formData, id_vendedor: e.target.value})}
                    required
                  >
                    <option value="">-- Seleccione un vendedor --</option>
                    {vendedores.map(vendedor => (
                      <option key={vendedor.id_usuario} value={vendedor.id_usuario}>
                        {vendedor.nombre_completo} ({vendedor.total_clientes} clientes)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Asignar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reasignar */}
      {showReasignarModal && (
        <div className={styles.modalOverlay} onClick={handleCloseReasignarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reasignar Cliente</h2>
              <button className={styles.modalClose} onClick={handleCloseReasignarModal}>✕</button>
            </div>

            <form onSubmit={handleReasignar}>
              <div className={styles.modalBody}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <div className={styles.infoBox}>
                  <strong>Cliente:</strong> {selectedAsignacion?.nombre_negocio}<br/>
                  <strong>Vendedor Actual:</strong> {selectedAsignacion?.vendedor_nombre}
                </div>

                <div className={styles.formGroup}>
                  <label>Nuevo Vendedor *</label>
                  <select
                    value={reasignarData.nuevo_id_vendedor}
                    onChange={(e) => setReasignarData({
                      ...reasignarData, 
                      nuevo_id_vendedor: e.target.value
                    })}
                    required
                  >
                    <option value="">-- Seleccione un vendedor --</option>
                    {vendedores
                      .filter(v => v.id_usuario !== selectedAsignacion?.id_vendedor)
                      .map(vendedor => (
                        <option key={vendedor.id_usuario} value={vendedor.id_usuario}>
                          {vendedor.nombre_completo} ({vendedor.total_clientes} clientes)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseReasignarModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Reasignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignarClientes;