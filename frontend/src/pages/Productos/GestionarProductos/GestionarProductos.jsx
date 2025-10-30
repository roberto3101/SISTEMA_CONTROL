import { useState, useEffect } from 'react';
import { productoAPI } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './GestionarProductos.module.css';

const GestionarProductos = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    stock_actual: '',
    stock_minimo: '',
    unidad_medida: 'UNIDAD',
    estado: 'activo'
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await productoAPI.getAll();
      
      if (response.data.success) {
        setProductos(response.data.data.productos);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, producto = null) => {
    setModalMode(mode);
    if (mode === 'edit' && producto) {
      setSelectedProducto(producto);
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio_unitario: producto.precio_unitario,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
        unidad_medida: producto.unidad_medida,
        estado: producto.estado
      });
    } else {
      setSelectedProducto(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio_unitario: '',
        stock_actual: '',
        stock_minimo: '',
        unidad_medida: 'UNIDAD',
        estado: 'activo'
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
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
        await productoAPI.create(formData);
        setSuccess('Producto creado exitosamente');
      } else {
        await productoAPI.update(selectedProducto.id_producto, formData);
        setSuccess('Producto actualizado exitosamente');
      }

      await fetchProductos();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) {
      return;
    }

    try {
      await productoAPI.delete(id);
      setSuccess('Producto eliminado exitosamente');
      await fetchProductos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar producto');
    }
  };

  const getEstadoBadgeClass = (estado) => {
    return estado === 'activo' ? styles.badgeActivo : styles.badgeInactivo;
  };

  const getStockBadgeClass = (producto) => {
    if (producto.stock_actual === 0) {
      return styles.badgeAgotado;
    } else if (producto.stock_actual <= producto.stock_minimo) {
      return styles.badgeBajo;
    }
    return styles.badgeDisponible;
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gestionar Productos</h1>
          <p>Administra el catálogo de productos del sistema</p>
        </div>
        {user?.rol === 'administrador' && (
          <button 
            className={styles.btnPrimary}
            onClick={() => handleOpenModal('create')}
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {error && !showModal && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && !showModal && (
        <div className={styles.successMessage}>{success}</div>
      )}

      {/* Estadísticas */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Productos</span>
            <span className={styles.statValue}>{productos.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Disponibles</span>
            <span className={styles.statValue}>
              {productos.filter(p => p.stock_actual > p.stock_minimo).length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Stock Bajo</span>
            <span className={styles.statValue}>
              {productos.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Agotados</span>
            <span className={styles.statValue}>
              {productos.filter(p => p.stock_actual === 0).length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre, código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Unidad</th>
              <th>Estado Stock</th>
              <th>Estado</th>
              {user?.rol === 'administrador' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={user?.rol === 'administrador' ? '9' : '8'} className={styles.noData}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </td>
              </tr>
            ) : (
              productosFiltrados.map(producto => (
                <tr key={producto.id_producto}>
                  <td>
                    <span className={styles.codigo}>{producto.codigo}</span>
                  </td>
                  <td>
                    <div className={styles.productoInfo}>
                      <strong>{producto.nombre}</strong>
                      {producto.descripcion && (
                        <span className={styles.descripcion}>{producto.descripcion}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.precio}>S/ {parseFloat(producto.precio_unitario).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className={styles.stockActual}>{producto.stock_actual}</span>
                  </td>
                  <td>{producto.stock_minimo}</td>
                  <td>{producto.unidad_medida}</td>
                  <td>
                    <span className={`${styles.badge} ${getStockBadgeClass(producto)}`}>
                      {producto.stock_actual === 0 ? 'Agotado' :
                       producto.stock_actual <= producto.stock_minimo ? 'Bajo' : 'OK'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getEstadoBadgeClass(producto.estado)}`}>
                      {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {user?.rol === 'administrador' && (
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => handleOpenModal('edit', producto)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(producto.id_producto)}
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

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Código *</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleChange}
                      required
                      placeholder="Ej: PROD001"
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Coca Cola 1.5L"
                    />
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción del producto"
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Precio Unitario *</label>
                    <input
                      type="number"
                      name="precio_unitario"
                      value={formData.precio_unitario}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Stock Actual *</label>
                    <input
                      type="number"
                      name="stock_actual"
                      value={formData.stock_actual}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Stock Mínimo *</label>
                    <input
                      type="number"
                      name="stock_minimo"
                      value={formData.stock_minimo}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="10"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Unidad de Medida *</label>
                    <select
                      name="unidad_medida"
                      value={formData.unidad_medida}
                      onChange={handleChange}
                      required
                    >
                      <option value="UNIDAD">Unidad</option>
                      <option value="CAJA">Caja</option>
                      <option value="PACK">Pack</option>
                      <option value="KG">Kilogramo</option>
                      <option value="LITRO">Litro</option>
                    </select>
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
                  {modalMode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarProductos;