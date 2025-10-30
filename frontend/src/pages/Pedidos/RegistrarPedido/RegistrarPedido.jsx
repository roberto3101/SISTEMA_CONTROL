import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { clienteAPI, productoAPI, pedidoAPI } from '../../../api/api';
import styles from './RegistrarPedido.module.css';


const RegistrarPedido = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);


  // Step 1: Cliente
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');
  
  // Step 2: Productos
  const [productos, setProductos] = useState([]);
  const [searchProducto, setSearchProducto] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [productoTemp, setProductoTemp] = useState(null);
  const [cantidadTemp, setCantidadTemp] = useState(1);
  
  // Totales
  const [subtotal, setSubtotal] = useState(0);
  const [igv, setIgv] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchProductos();
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [carrito]);

  const fetchClientes = async () => {
    try {
      // Si es vendedor, obtener solo sus clientes asignados
      const response = user?.rol === 'vendedor' 
        ? await clienteAPI.getMisClientes() 
        : await clienteAPI.getAll();
      
      if (response.data.success) {
        setClientes(response.data.data.clientes);
      }
    } catch (error) {
      setError('Error al cargar clientes');
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await productoAPI.getAll();
      if (response.data.success) {
        setProductos(response.data.data.productos.filter(p => p.stock_actual > 0));
      }
    } catch (error) {
      setError('Error al cargar productos');
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setStep(2);
    setError('');
  };

  const handleAgregarProducto = () => {
    if (!productoTemp) {
      setError('Seleccione un producto');
      return;
    }

    if (cantidadTemp <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidadTemp > productoTemp.stock_actual) {
      setError(`Stock insuficiente. Disponible: ${productoTemp.stock_actual}`);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = carrito.find(item => item.id_producto === productoTemp.id_producto);
    
    if (productoEnCarrito) {
      const nuevaCantidad = productoEnCarrito.cantidad + cantidadTemp;
      if (nuevaCantidad > productoTemp.stock_actual) {
        setError(`Stock insuficiente. Disponible: ${productoTemp.stock_actual}`);
        return;
      }
      
      setCarrito(carrito.map(item =>
        item.id_producto === productoTemp.id_producto
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: parseFloat((nuevaCantidad * item.precio_unitario).toFixed(2))
            }
          : item
      ));
    } else {
      const nuevoItem = {
        id_producto: productoTemp.id_producto,
        codigo: productoTemp.codigo,
        nombre: productoTemp.nombre,
        precio_unitario: parseFloat(productoTemp.precio_unitario),
        cantidad: cantidadTemp,
        stock_disponible: productoTemp.stock_actual,
        subtotal: parseFloat((cantidadTemp * productoTemp.precio_unitario).toFixed(2))
      };
      setCarrito([...carrito, nuevoItem]);
    }

    setProductoTemp(null);
    setCantidadTemp(1);
    setSearchProducto('');
    setError('');
  };

  const handleEliminarProducto = (idProducto) => {
    setCarrito(carrito.filter(item => item.id_producto !== idProducto));
  };

  const handleCantidadChange = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;

    const producto = carrito.find(item => item.id_producto === idProducto);
    if (nuevaCantidad > producto.stock_disponible) {
      setError(`Stock insuficiente. Disponible: ${producto.stock_disponible}`);
      return;
    }

    setCarrito(carrito.map(item =>
      item.id_producto === idProducto
        ? {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: parseFloat((nuevaCantidad * item.precio_unitario).toFixed(2))
          }
        : item
    ));
    setError('');
  };

  const calcularTotales = () => {
    const nuevoSubtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const nuevoIgv = parseFloat((nuevoSubtotal * 0.18).toFixed(2));
    const nuevoTotal = parseFloat((nuevoSubtotal + nuevoIgv).toFixed(2));

    setSubtotal(nuevoSubtotal);
    setIgv(nuevoIgv);
    setTotal(nuevoTotal);
  };

  const handleConfirmarPedido = async () => {
    if (carrito.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pedidoData = {
        id_cliente: clienteSeleccionado.id_cliente,
        subtotal,
        igv,
        total,
        observaciones,
        productos: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      };

      const response = await pedidoAPI.create(pedidoData);

      if (response.data.success) {
        setSuccess('Pedido registrado exitosamente');
        setTimeout(() => {
          // Resetear formulario
          setStep(1);
          setClienteSeleccionado(null);
          setCarrito([]);
          setObservaciones('');
          setSuccess('');
          fetchProductos(); // Recargar productos para actualizar stock
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar pedido');
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre_negocio.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.nombre_contacto.toLowerCase().includes(searchCliente.toLowerCase())
  );

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchProducto.toLowerCase())
  );

  return (
    <div className={styles.container}>
<div className={styles.header}>
        <div>
          <h1>Registrar Pedido</h1>
          <p>Crea un nuevo pedido seleccionando cliente y productos</p>
        </div>
        <button 
          className={styles.btnHistorial}
          onClick={() => navigate('/pedidos/lista')}
        >
          📋 Ver Historial de Pedidos
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      {/* Stepper */}
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <span>Seleccionar Cliente</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <span>Agregar Productos</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <span>Confirmar Pedido</span>
        </div>
      </div>

      <div className={styles.content}>
        {/* STEP 1: Seleccionar Cliente */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2>Seleccionar Cliente</h2>
            
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o negocio..."
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>

            <div className={styles.clientesGrid}>
              {clientesFiltrados.length === 0 ? (
                <div className={styles.noData}>No se encontraron clientes</div>
              ) : (
                clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id_cliente}
                    className={styles.clienteCard}
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <div className={styles.clienteAvatar}>
                      {cliente.nombre_negocio.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.clienteInfo}>
                      <h3>{cliente.nombre_negocio}</h3>
                      <p>{cliente.nombre_contacto}</p>
                      <span className={styles.clienteDistrito}>{cliente.distrito || 'Sin distrito'}</span>
                    </div>
                    {cliente.tiene_deuda === 1 && (
                      <div className={styles.deudaBadge}>Con deuda</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Agregar Productos */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2>Agregar Productos al Pedido</h2>
              <button 
                className={styles.btnSecondary}
                onClick={() => setStep(1)}
              >
                ← Cambiar Cliente
              </button>
            </div>

            <div className={styles.clienteSelected}>
              <strong>Cliente:</strong> {clienteSeleccionado?.nombre_negocio} - {clienteSeleccionado?.nombre_contacto}
            </div>

            <div className={styles.agregarProducto}>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchProducto}
                  onChange={(e) => setSearchProducto(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>

              {searchProducto && productosFiltrados.length > 0 && (
                <div className={styles.productosDropdown}>
                  {productosFiltrados.slice(0, 5).map(producto => (
                    <div
                      key={producto.id_producto}
                      className={styles.productoOption}
                      onClick={() => {
                        setProductoTemp(producto);
                        setSearchProducto('');
                      }}
                    >
                      <div>
                        <strong>{producto.nombre}</strong>
                        <span className={styles.productoCodigo}>{producto.codigo}</span>
                      </div>
                      <div className={styles.productoDetails}>
                        <span className={styles.productoPrecio}>S/ {parseFloat(producto.precio_unitario).toFixed(2)}</span>
                        <span className={styles.productoStock}>Stock: {producto.stock_actual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {productoTemp && (
                <div className={styles.productoSeleccionado}>
                  <div className={styles.productoInfo}>
                    <strong>{productoTemp.nombre}</strong>
                    <span>Precio: S/ {parseFloat(productoTemp.precio_unitario).toFixed(2)}</span>
                    <span>Stock disponible: {productoTemp.stock_actual}</span>
                  </div>
                  <div className={styles.cantidadControl}>
                    <label>Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      max={productoTemp.stock_actual}
                      value={cantidadTemp}
                      onChange={(e) => setCantidadTemp(parseInt(e.target.value) || 1)}
                      className={styles.cantidadInput}
                    />
                    <button 
                      className={styles.btnPrimary}
                      onClick={handleAgregarProducto}
                    >
                      Agregar
                    </button>
                    <button 
                      className={styles.btnCancel}
                      onClick={() => {
                        setProductoTemp(null);
                        setCantidadTemp(1);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Carrito */}
            {carrito.length > 0 && (
              <>
                <div className={styles.carrito}>
                  <h3>Productos en el Pedido ({carrito.length})</h3>
                  <table className={styles.carritoTable}>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unit.</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map(item => (
                        <tr key={item.id_producto}>
                          <td>
                            <div>
                              <strong>{item.nombre}</strong>
                              <br />
                              <span className={styles.productoCodigo}>{item.codigo}</span>
                            </div>
                          </td>
                          <td>S/ {item.precio_unitario.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.stock_disponible}
                              value={item.cantidad}
                              onChange={(e) => handleCantidadChange(item.id_producto, parseInt(e.target.value) || 1)}
                              className={styles.cantidadInputSmall}
                            />
                          </td>
                          <td className={styles.subtotalCell}>S/ {item.subtotal.toFixed(2)}</td>
                          <td>
                            <button
                              className={styles.btnDelete}
                              onClick={() => handleEliminarProducto(item.id_producto)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.totales}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>IGV (18%):</span>
                    <span>S/ {igv.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>TOTAL:</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.observaciones}>
                  <label>Observaciones (opcional):</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar notas sobre el pedido..."
                    rows={3}
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setCarrito([])}
                  >
                    Limpiar Carrito
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => setStep(3)}
                  >
                    Continuar a Confirmación →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: Confirmar Pedido */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2>Confirmar Pedido</h2>

            <div className={styles.resumen}>
              <div className={styles.resumenSection}>
                <h3>Cliente</h3>
                <p><strong>Negocio:</strong> {clienteSeleccionado?.nombre_negocio}</p>
                <p><strong>Contacto:</strong> {clienteSeleccionado?.nombre_contacto}</p>
                <p><strong>Dirección:</strong> {clienteSeleccionado?.direccion || 'Sin dirección'}</p>
              </div>

              <div className={styles.resumenSection}>
                <h3>Productos ({carrito.length})</h3>
                {carrito.map(item => (
                  <div key={item.id_producto} className={styles.resumenProducto}>
                    <span>{item.nombre} x {item.cantidad}</span>
                    <span>S/ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.resumenSection}>
                <h3>Totales</h3>
                <div className={styles.resumenTotal}>
                  <span>Subtotal:</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.resumenTotal}>
                  <span>IGV (18%):</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </div>
                <div className={`${styles.resumenTotal} ${styles.resumenFinal}`}>
                  <span>TOTAL:</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>

              {observaciones && (
                <div className={styles.resumenSection}>
                  <h3>Observaciones</h3>
                  <p>{observaciones}</p>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← Volver a Editar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleConfirmarPedido}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarPedido;