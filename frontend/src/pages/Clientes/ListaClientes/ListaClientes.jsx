import { useState, useEffect } from 'react';
import { clienteAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './ListaClientes.module.css';

const ListaClientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    nombre_contacto: '',
    telefono: '',
    direccion: '',
    distrito: '',
    referencia: '',
    tiene_deuda: false,
    estado: 'activo'
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteAPI.getAll();
      
      if (response.data.success) {
        setClientes(response.data.data.clientes);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, cliente = null) => {
    setModalMode(mode);
    if (mode === 'edit' && cliente) {
      setSelectedCliente(cliente);
      setFormData({
        nombre_negocio: cliente.nombre_negocio,
        nombre_contacto: cliente.nombre_contacto,
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        distrito: cliente.distrito || '',
        referencia: cliente.referencia || '',
        tiene_deuda: cliente.tiene_deuda === 1,
        estado: cliente.estado
      });
    } else {
      setSelectedCliente(null);
      setFormData({
        nombre_negocio: '',
        nombre_contacto: '',
        telefono: '',
        direccion: '',
        distrito: '',
        referencia: '',
        tiene_deuda: false,
        estado: 'activo'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCliente(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        await clienteAPI.create(formData);
      } else {
        await clienteAPI.update(selectedCliente.id_cliente, formData);
      }

      await fetchClientes();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) {
      return;
    }

    try {
      await clienteAPI.delete(id);
      await fetchClientes();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const getEstadoBadgeClass = (estado) => {
    return estado === 'activo' ? styles.badgeActivo : styles.badgeInactivo;
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.distrito && cliente.distrito.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.telefono && cliente.telefono.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gestión de Clientes</h1>
          <p>Administra todos los clientes del sistema</p>
        </div>
        {user?.rol === 'administrador' && (
          <button 
            className={styles.btnPrimary}
            onClick={() => handleOpenModal('create')}
          >
            + Nuevo Cliente
          </button>
        )}
      </div>

      {error && !showModal && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre, contacto, distrito o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏢</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Clientes</span>
            <span className={styles.statValue}>{clientes.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Activos</span>
            <span className={styles.statValue}>
              {clientes.filter(c => c.estado === 'activo').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Con Deuda</span>
            <span className={styles.statValue}>
              {clientes.filter(c => c.tiene_deuda === 1).length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Negocio</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Distrito</th>
              <th>Estado</th>
              <th>Deuda</th>
              {user?.rol === 'administrador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={user?.rol === 'administrador' ? '8' : '7'} className={styles.noData}>
                  {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                </td>
              </tr>
            ) : (
              clientesFiltrados.map(cliente => (
                <tr key={cliente.id_cliente}>
                  <td>{cliente.id_cliente}</td>
                  <td>
                    <div className={styles.clientName}>
                      <div className={styles.clientAvatar}>
                        {cliente.nombre_negocio.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.businessName}>{cliente.nombre_negocio}</div>
                        {cliente.direccion && (
                          <div className={styles.address}>{cliente.direccion}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{cliente.nombre_contacto}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td>{cliente.distrito || '-'}</td>
                  <td>
                    <span className={`${styles.badge} ${getEstadoBadgeClass(cliente.estado)}`}>
                      {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {cliente.tiene_deuda === 1 ? (
                      <span className={styles.deudaSi}>Sí</span>
                    ) : (
                      <span className={styles.deudaNo}>No</span>
                    )}
                  </td>
                  {user?.rol === 'administrador' && (
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => handleOpenModal('edit', cliente)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(cliente.id_cliente)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Nombre del Negocio *</label>
                    <input
                      type="text"
                      name="nombre_negocio"
                      value={formData.nombre_negocio}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Bodega San José"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nombre de Contacto *</label>
                    <input
                      type="text"
                      name="nombre_contacto"
                      value={formData.nombre_contacto}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 987654321"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Distrito</label>
                    <input
                      type="text"
                      name="distrito"
                      value={formData.distrito}
                      onChange={handleChange}
                      placeholder="Ej: San Juan de Lurigancho"
                    />
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Av. Los Pinos 123"
                    />
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                    <label>Referencia</label>
                    <textarea
                      name="referencia"
                      value={formData.referencia}
                      onChange={handleChange}
                      placeholder="Ej: A dos cuadras del parque principal"
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="tiene_deuda"
                        checked={formData.tiene_deuda}
                        onChange={handleChange}
                      />
                      <span>Tiene deuda pendiente</span>
                    </label>
                  </div>
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
                  {modalMode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;