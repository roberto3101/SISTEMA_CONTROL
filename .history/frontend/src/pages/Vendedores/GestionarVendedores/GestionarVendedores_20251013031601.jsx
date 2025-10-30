import { useState, useEffect } from 'react';
import { vendedorAPI } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import styles from './GestionarVendedores.module.css';

const GestionarVendedores = () => {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const [vendedoresRes, statsRes] = await Promise.all([
        vendedorAPI.getAll(),
        vendedorAPI.getEstadisticas()
      ]);

      if (vendedoresRes.data.success) {
        setVendedores(vendedoresRes.data.data.vendedores);
      }
      if (statsRes.data.success) {
        setEstadisticas(statsRes.data.data.estadisticas);
      }
    } catch (error) {
      setError('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, vendedor = null) => {
    setModalMode(mode);
    if (mode === 'edit' && vendedor) {
      setSelectedVendedor(vendedor);
      setFormData({
        nombre_completo: vendedor.nombre_completo,
        email: vendedor.email,
        password: '',
        estado: vendedor.estado
      });
    } else {
      setSelectedVendedor(null);
      setFormData({
        nombre_completo: '',
        email: '',
        password: '',
        estado: 'activo'
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVendedor(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        if (!formData.password) {
          setError('La contraseña es requerida');
          return;
        }
        await vendedorAPI.create(formData);
        setSuccess('Vendedor creado exitosamente');
      } else {
        const updateData = {
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          estado: formData.estado
        };
        await vendedorAPI.update(selectedVendedor.id_usuario, updateData);
        setSuccess('Vendedor actualizado exitosamente');
      }

      await fetchVendedores();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar vendedor');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado del vendedor a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      await vendedorAPI.updateEstado(id, nuevoEstado);
      setSuccess('Estado actualizado exitosamente');
      await fetchVendedores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al actualizar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este vendedor?')) {
      return;
    }

    try {
      await vendedorAPI.delete(id);
      setSuccess('Vendedor desactivado exitosamente');
      await fetchVendedores();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al desactivar vendedor');
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/vendedores/detalle/${id}`);
  };

  const vendedoresFiltrados = vendedores.filter(v =>
    v.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadgeClass = (estado) => {
    const classes = {
      'activo': styles.badgeActivo,
      'inactivo': styles.badgeInactivo,
      'bloqueado': styles.badgeBloqueado
    };
    return classes[estado] || styles.badgeActivo;
  };

  const getEstadisticasVendedor = (idVendedor) => {
    return estadisticas.find(e => e.id_usuario === idVendedor) || {
      total_clientes: 0,
      total_pedidos: 0,
      monto_total_vendido: 0,
      total_visitas: 0
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando vendedores...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gestionar Vendedores</h1>
          <p>Administra los vendedores del sistema</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => handleOpenModal('create')}
        >
          + Nuevo Vendedor
        </button>
      </div>

      {error && !showModal && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && !showModal && (
        <div className={styles.successMessage}>{success}</div>
      )}

      {/* Estadísticas generales */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Vendedores</span>
            <span className={styles.statValue}>{vendedores.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Activos</span>
            <span className={styles.statValue}>
              {vendedores.filter(v => v.estado === 'activo').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Pedidos</span>
            <span className={styles.statValue}>
              {estadisticas.reduce((sum, e) => sum + (e.total_pedidos || 0), 0)}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Ventas Totales</span>
            <span className={styles.statValue}>
              S/ {estadisticas.reduce((sum, e) => sum + parseFloat(e.monto_total_vendido || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {/* Grid de vendedores */}
      <div className={styles.vendedoresGrid}>
        {vendedoresFiltrados.length === 0 ? (
          <div className={styles.noData}>
            {searchTerm ? 'No se encontraron vendedores' : 'No hay vendedores registrados'}
          </div>
        ) : (
          vendedoresFiltrados.map(vendedor => {
            const stats = getEstadisticasVendedor(vendedor.id_usuario);
            return (
              <div key={vendedor.id_usuario} className={styles.vendedorCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.vendedorAvatar}>
                    {vendedor.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className={`${styles.badge} ${getEstadoBadgeClass(vendedor.estado)}`}>
                    {vendedor.estado}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3>{vendedor.nombre_completo}</h3>
                  <p className={styles.email}>{vendedor.email}</p>

                  <div className={styles.estadisticas}>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>🏢</span>
                      <div>
                        <span className={styles.statNumber}>{stats.total_clientes}</span>
                        <span className={styles.statText}>Clientes</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>📦</span>
                      <div>
                        <span className={styles.statNumber}>{stats.total_pedidos}</span>
                        <span className={styles.statText}>Pedidos</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>📅</span>
                      <div>
                        <span className={styles.statNumber}>{stats.total_visitas}</span>
                        <span className={styles.statText}>Visitas</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>💰</span>
                      <div>
                        <span className={styles.statNumber}>
                          S/ {parseFloat(stats.monto_total_vendido || 0).toFixed(0)}
                        </span>
                        <span className={styles.statText}>Vendido</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    className={styles.btnDetalle}
                    onClick={() => handleVerDetalle(vendedor.id_usuario)}
                  >
                    👁️ Ver Detalle
                  </button>
                  <button
                    className={styles.btnEdit}
                    onClick={() => handleOpenModal('edit', vendedor)}
                  >
                    ✏️
                  </button>
                  {vendedor.estado === 'activo' ? (
                    <button
                      className={styles.btnInactivar}
                      onClick={() => handleCambiarEstado(vendedor.id_usuario, 'inactivo')}
                      title="Desactivar"
                    >
                      🚫
                    </button>
                  ) : (
                    <button
                      className={styles.btnActivar}
                      onClick={() => handleCambiarEstado(vendedor.id_usuario, 'activo')}
                      title="Activar"
                    >
                      ✅
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === 'create' ? 'Nuevo Vendedor' : 'Editar Vendedor'}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <div className={styles.formGroup}>
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Ej: juan.perez@sistema.com"
                  />
                </div>

                {modalMode === 'create' && (
                  <div className={styles.formGroup}>
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnSecondary}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {modalMode === 'create' ? 'Crear Vendedor' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarVendedores;