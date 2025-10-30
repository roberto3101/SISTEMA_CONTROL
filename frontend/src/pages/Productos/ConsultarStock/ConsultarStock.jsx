import { useState, useEffect } from 'react';
import { productoAPI } from '../../../api/api';
import styles from './ConsultarStock.module.css';

const ConsultarStock = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos'); // 'todos', 'disponible', 'bajo', 'agotado'
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [searchTerm, filtroStock, productos]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const [productosRes, stockBajoRes] = await Promise.all([
        productoAPI.getAll(),
        productoAPI.getStockBajo()
      ]);

      if (productosRes.data.success) {
        setProductos(productosRes.data.data.productos);
      }
      if (stockBajoRes.data.success) {
        setStockBajo(stockBajoRes.data.data.productos);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarProductos = () => {
    let filtered = productos;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado de stock
    if (filtroStock === 'disponible') {
      filtered = filtered.filter(p => p.stock_actual > p.stock_minimo);
    } else if (filtroStock === 'bajo') {
      filtered = filtered.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
    } else if (filtroStock === 'agotado') {
      filtered = filtered.filter(p => p.stock_actual === 0);
    }

    setProductosFiltrados(filtered);
  };

  const handleVerDetalle = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  const getStockBadgeClass = (producto) => {
    if (producto.stock_actual === 0) {
      return styles.badgeAgotado;
    } else if (producto.stock_actual <= producto.stock_minimo) {
      return styles.badgeBajo;
    }
    return styles.badgeDisponible;
  };

  const getStockLabel = (producto) => {
    if (producto.stock_actual === 0) {
      return 'Agotado';
    } else if (producto.stock_actual <= producto.stock_minimo) {
      return 'Stock Bajo';
    }
    return 'Disponible';
  };

  const formatPrecio = (precio) => {
    return `S/ ${parseFloat(precio).toFixed(2)}`;
  };

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
          <h1>Consultar Stock de Productos</h1>
          <p>Consulta la disponibilidad de productos en inventario</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
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
            <span className={styles.statValue}>{stockBajo.length}</span>
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

      {/* Alertas de Stock Bajo */}
      {stockBajo.length > 0 && (
        <div className={styles.alertSection}>
          <div className={styles.alertHeader}>
            <span className={styles.alertIcon}>⚠️</span>
            <strong>Productos con Stock Bajo ({stockBajo.length})</strong>
          </div>
          <div className={styles.alertProducts}>
            {stockBajo.slice(0, 5).map(producto => (
              <div key={producto.id_producto} className={styles.alertItem}>
                <span className={styles.alertProductName}>{producto.nombre}</span>
                <span className={styles.alertStock}>
                  Stock: {producto.stock_actual} / Mínimo: {producto.stock_minimo}
                </span>
              </div>
            ))}
            {stockBajo.length > 5 && (
              <div className={styles.alertMore}>
                y {stockBajo.length - 5} productos más...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controles de Búsqueda y Filtrado */}
      <div className={styles.controls}>
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

        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filtroStock === 'todos' ? styles.active : ''}`}
            onClick={() => setFiltroStock('todos')}
          >
            Todos
          </button>
          <button
            className={`${styles.filterBtn} ${filtroStock === 'disponible' ? styles.active : ''}`}
            onClick={() => setFiltroStock('disponible')}
          >
            Disponibles
          </button>
          <button
            className={`${styles.filterBtn} ${filtroStock === 'bajo' ? styles.active : ''}`}
            onClick={() => setFiltroStock('bajo')}
          >
            Stock Bajo
          </button>
          <button
            className={`${styles.filterBtn} ${filtroStock === 'agotado' ? styles.active : ''}`}
            onClick={() => setFiltroStock('agotado')}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className={styles.productsGrid}>
        {productosFiltrados.length === 0 ? (
          <div className={styles.noData}>
            {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </div>
        ) : (
          productosFiltrados.map(producto => (
            <div key={producto.id_producto} className={styles.productCard}>
              <div className={styles.productHeader}>
                <span className={styles.productCode}>{producto.codigo}</span>
                <span className={`${styles.badge} ${getStockBadgeClass(producto)}`}>
                  {getStockLabel(producto)}
                </span>
              </div>

              <div className={styles.productBody}>
                <h3 className={styles.productName}>{producto.nombre}</h3>
                {producto.descripcion && (
                  <p className={styles.productDescription}>{producto.descripcion}</p>
                )}

                <div className={styles.productInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Precio:</span>
                    <span className={styles.infoValue}>{formatPrecio(producto.precio_unitario)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Stock Actual:</span>
                    <span className={`${styles.infoValue} ${styles.stockValue}`}>
                      {producto.stock_actual}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Stock Mínimo:</span>
                    <span className={styles.infoValue}>{producto.stock_minimo}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Unidad:</span>
                    <span className={styles.infoValue}>{producto.unidad_medida}</span>
                  </div>
                </div>

                {/* Barra de progreso de stock */}
                <div className={styles.stockProgress}>
                  <div 
                    className={styles.stockProgressBar}
                    style={{
                      width: `${Math.min((producto.stock_actual / (producto.stock_minimo * 2)) * 100, 100)}%`,
                      backgroundColor: producto.stock_actual === 0 ? '#e74c3c' :
                                      producto.stock_actual <= producto.stock_minimo ? '#f39c12' : '#27ae60'
                    }}
                  />
                </div>
              </div>

              <div className={styles.productFooter}>
                <button
                  className={styles.btnDetalle}
                  onClick={() => handleVerDetalle(producto)}
                >
                  Ver Detalle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalle */}
      {showModal && selectedProducto && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalle del Producto</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Código:</span>
                  <span className={styles.detailValue}>{selectedProducto.codigo}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Nombre:</span>
                  <span className={styles.detailValue}>{selectedProducto.nombre}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Descripción:</span>
                  <span className={styles.detailValue}>
                    {selectedProducto.descripcion || 'Sin descripción'}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Precio Unitario:</span>
                  <span className={styles.detailValue}>
                    {formatPrecio(selectedProducto.precio_unitario)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Stock Actual:</span>
                  <span className={`${styles.detailValue} ${styles.highlight}`}>
                    {selectedProducto.stock_actual}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Stock Mínimo:</span>
                  <span className={styles.detailValue}>{selectedProducto.stock_minimo}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Unidad de Medida:</span>
                  <span className={styles.detailValue}>{selectedProducto.unidad_medida}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Estado:</span>
                  <span className={`${styles.badge} ${getStockBadgeClass(selectedProducto)}`}>
                    {getStockLabel(selectedProducto)}
                  </span>
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

export default ConsultarStock;