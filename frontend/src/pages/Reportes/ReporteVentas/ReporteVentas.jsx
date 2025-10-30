import { useState, useEffect } from 'react';
import { reporteAPI } from '../../../api/api';
import { exportarExcel, exportarPDF } from '../../../utils/exportUtils';
import styles from './ReporteVentas.module.css';

const ReporteVentas = () => {
  const [tipoReporte, setTipoReporte] = useState('ventas-periodo');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Establecer fechas por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    setFechaInicio(hace30Dias.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  }, []);

  const generarReporte = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      switch(tipoReporte) {
        case 'ventas-periodo':
          response = await reporteAPI.getVentasPorPeriodo(fechaInicio, fechaFin);
          setDatos(response.data.data.ventas);
          break;
        case 'ventas-vendedor':
          response = await reporteAPI.getVentasPorVendedor(fechaInicio, fechaFin);
          setDatos(response.data.data.vendedores);
          break;
        case 'productos-vendidos':
          response = await reporteAPI.getProductosMasVendidos(fechaInicio, fechaFin, 20);
          setDatos(response.data.data.productos);
          break;
        case 'clientes':
          response = await reporteAPI.getReporteClientes();
          setDatos(response.data.data.clientes);
          break;
        case 'boletas':
          response = await reporteAPI.getReporteBoletas(fechaInicio, fechaFin);
          setDatos(response.data.data.boletas);
          break;
        default:
          break;
      }
    } catch (error) {
      setError('Error al generar reporte');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportarAExcel = () => {
    const datosExcel = prepararDatosExcel();
    exportarExcel(datosExcel, `Reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}`, getTituloReporte());
  };

  const exportarAPDF = () => {
    const { columnas, filas } = prepararDatosPDF();
    exportarPDF(getTituloReporte(), columnas, filas, `Reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}`);
  };

  const getTituloReporte = () => {
    const titulos = {
      'ventas-periodo': 'Reporte de Ventas por Periodo',
      'ventas-vendedor': 'Reporte de Ventas por Vendedor',
      'productos-vendidos': 'Productos Más Vendidos',
      'clientes': 'Reporte de Clientes',
      'boletas': 'Reporte de Boletas Emitidas'
    };
    return titulos[tipoReporte];
  };

  const prepararDatosExcel = () => {
    switch(tipoReporte) {
      case 'ventas-periodo':
        return datos.map(d => ({
          'Fecha': new Date(d.fecha).toLocaleDateString('es-PE'),
          'Total Pedidos': d.total_pedidos,
          'Pedidos Entregados': d.pedidos_entregados,
          'Pedidos Anulados': d.pedidos_anulados,
          'Monto Total': parseFloat(d.monto_total).toFixed(2),
          'Monto Entregado': parseFloat(d.monto_entregado).toFixed(2)
        }));
      case 'ventas-vendedor':
        return datos.map(d => ({
          'Vendedor': d.vendedor,
          'Total Pedidos': d.total_pedidos,
          'Pedidos Entregados': d.pedidos_entregados,
          'Clientes Atendidos': d.clientes_atendidos,
          'Monto Total': parseFloat(d.monto_total || 0).toFixed(2),
          'Monto Entregado': parseFloat(d.monto_entregado || 0).toFixed(2)
        }));
      case 'productos-vendidos':
        return datos.map(d => ({
          'Código': d.codigo,
          'Producto': d.nombre,
          'Cantidad Vendida': d.cantidad_vendida,
          'Pedidos': d.pedidos_count,
          'Monto Total': parseFloat(d.monto_total).toFixed(2)
        }));
      case 'clientes':
        return datos.map(d => ({
          'Cliente': d.nombre_negocio,
          'Contacto': d.nombre_contacto,
          'Teléfono': d.telefono || '',
          'Distrito': d.distrito || '',
          'Total Pedidos': d.total_pedidos || 0,
          'Monto Total': parseFloat(d.monto_total || 0).toFixed(2),
          'Última Compra': d.ultima_compra ? new Date(d.ultima_compra).toLocaleDateString('es-PE') : 'N/A',
          'Vendedor Asignado': d.vendedor_asignado || 'Sin asignar'
        }));
      case 'boletas':
        return datos.map(d => ({
          'N° Boleta': d.numero_boleta,
          'Fecha Emisión': new Date(d.fecha_emision).toLocaleDateString('es-PE'),
          'Cliente': d.nombre_negocio,
          'Vendedor': d.vendedor,
          'Auxiliar': d.auxiliar || 'N/A',
          'Total': parseFloat(d.total).toFixed(2),
          'Estado': d.estado
        }));
      default:
        return [];
    }
  };

  const prepararDatosPDF = () => {
    switch(tipoReporte) {
      case 'ventas-periodo':
        return {
          columnas: ['Fecha', 'Total Pedidos', 'Entregados', 'Anulados', 'Monto Total', 'Monto Entregado'],
          filas: datos.map(d => [
            new Date(d.fecha).toLocaleDateString('es-PE'),
            d.total_pedidos,
            d.pedidos_entregados,
            d.pedidos_anulados,
            `S/ ${parseFloat(d.monto_total).toFixed(2)}`,
            `S/ ${parseFloat(d.monto_entregado).toFixed(2)}`
          ])
        };
      case 'ventas-vendedor':
        return {
          columnas: ['Vendedor', 'Pedidos', 'Entregados', 'Clientes', 'Monto Total', 'Entregado'],
          filas: datos.map(d => [
            d.vendedor,
            d.total_pedidos,
            d.pedidos_entregados,
            d.clientes_atendidos,
            `S/ ${parseFloat(d.monto_total || 0).toFixed(2)}`,
            `S/ ${parseFloat(d.monto_entregado || 0).toFixed(2)}`
          ])
        };
      case 'productos-vendidos':
        return {
          columnas: ['Código', 'Producto', 'Cantidad', 'Pedidos', 'Monto Total'],
          filas: datos.map(d => [
            d.codigo,
            d.nombre,
            d.cantidad_vendida,
            d.pedidos_count,
            `S/ ${parseFloat(d.monto_total).toFixed(2)}`
          ])
        };
      case 'clientes':
        return {
          columnas: ['Cliente', 'Contacto', 'Teléfono', 'Distrito', 'Pedidos', 'Monto', 'Vendedor'],
          filas: datos.map(d => [
            d.nombre_negocio,
            d.nombre_contacto,
            d.telefono || '',
            d.distrito || '',
            d.total_pedidos || 0,
            `S/ ${parseFloat(d.monto_total || 0).toFixed(2)}`,
            d.vendedor_asignado || 'Sin asignar'
          ])
        };
      case 'boletas':
        return {
          columnas: ['N° Boleta', 'Fecha', 'Cliente', 'Vendedor', 'Total', 'Estado'],
          filas: datos.map(d => [
            d.numero_boleta,
            new Date(d.fecha_emision).toLocaleDateString('es-PE'),
            d.nombre_negocio,
            d.vendedor,
            `S/ ${parseFloat(d.total).toFixed(2)}`,
            d.estado.toUpperCase()
          ])
        };
      default:
        return { columnas: [], filas: [] };
    }
  };

  const renderTabla = () => {
    if (datos.length === 0) return null;

    switch(tipoReporte) {
      case 'ventas-periodo':
        return (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total Pedidos</th>
                <th>Entregados</th>
                <th>Anulados</th>
                <th>Monto Total</th>
                <th>Monto Entregado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, idx) => (
                <tr key={idx}>
                  <td>{new Date(d.fecha).toLocaleDateString('es-PE')}</td>
                  <td>{d.total_pedidos}</td>
                  <td>{d.pedidos_entregados}</td>
                  <td>{d.pedidos_anulados}</td>
                  <td className={styles.montoTotal}>S/ {parseFloat(d.monto_total).toFixed(2)}</td>
                  <td className={styles.montoEntregado}>S/ {parseFloat(d.monto_entregado).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'ventas-vendedor':
        return (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Total Pedidos</th>
                <th>Entregados</th>
                <th>Clientes</th>
                <th>Monto Total</th>
                <th>Monto Entregado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.vendedor}</td>
                  <td>{d.total_pedidos}</td>
                  <td>{d.pedidos_entregados}</td>
                  <td>{d.clientes_atendidos}</td>
                  <td className={styles.montoTotal}>S/ {parseFloat(d.monto_total || 0).toFixed(2)}</td>
                  <td className={styles.montoEntregado}>S/ {parseFloat(d.monto_entregado || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'productos-vendidos':
        return (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
                <th>N° Pedidos</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.codigo}</td>
                  <td>{d.nombre}</td>
                  <td className={styles.cantidadVendida}>{d.cantidad_vendida}</td>
                  <td>{d.pedidos_count}</td>
                  <td className={styles.montoTotal}>S/ {parseFloat(d.monto_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'clientes':
        return (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Distrito</th>
                <th>Pedidos</th>
                <th>Monto Total</th>
                <th>Última Compra</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.nombre_negocio}</td>
                  <td>{d.nombre_contacto}</td>
                  <td>{d.telefono || '-'}</td>
                  <td>{d.distrito || '-'}</td>
                  <td>{d.total_pedidos || 0}</td>
                  <td className={styles.montoTotal}>S/ {parseFloat(d.monto_total || 0).toFixed(2)}</td>
                  <td>{d.ultima_compra ? new Date(d.ultima_compra).toLocaleDateString('es-PE') : 'N/A'}</td>
                  <td>{d.vendedor_asignado || 'Sin asignar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'boletas':
        return (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Boleta</th>
                <th>Fecha Emisión</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Auxiliar</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, idx) => (
                <tr key={idx}>
                  <td className={styles.numeroBoleta}>{d.numero_boleta}</td>
                  <td>{new Date(d.fecha_emision).toLocaleDateString('es-PE')}</td>
                  <td>{d.nombre_negocio}</td>
                  <td>{d.vendedor}</td>
                  <td>{d.auxiliar || 'N/A'}</td>
                  <td className={styles.montoTotal}>S/ {parseFloat(d.total).toFixed(2)}</td>
                  <td>
                    <span className={styles[`badge${d.estado.charAt(0).toUpperCase() + d.estado.slice(1)}`]}>
                      {d.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Reportes y Estadísticas</h1>
        <p>Genera y exporta reportes del sistema</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      <div className={styles.controlPanel}>
        <div className={styles.formGroup}>
          <label>Tipo de Reporte</label>
          <select 
            value={tipoReporte} 
            onChange={(e) => setTipoReporte(e.target.value)}
            className={styles.select}
          >
            <option value="ventas-periodo">Ventas por Periodo</option>
            <option value="ventas-vendedor">Ventas por Vendedor</option>
            <option value="productos-vendidos">Productos Más Vendidos</option>
            <option value="clientes">Reporte de Clientes</option>
            <option value="boletas">Boletas Emitidas</option>
          </select>
        </div>

        {tipoReporte !== 'clientes' && (
          <>
            <div className={styles.formGroup}>
              <label>Fecha Inicio</label>
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fecha Fin</label>
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={styles.input}
              />
            </div>
          </>
        )}

        <div className={styles.buttonGroup}>
          <button 
            onClick={generarReporte}
            className={styles.btnGenerar}
            disabled={loading}
          >
            {loading ? '⏳ Generando...' : '🔍 Generar Reporte'}
          </button>

          {datos.length > 0 && (
            <>
              <button 
                onClick={exportarAExcel}
                className={styles.btnExcel}
              >
                📗 Exportar Excel
              </button>

              <button 
                onClick={exportarAPDF}
                className={styles.btnPDF}
              >
                📕 Exportar PDF
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Generando reporte...</p>
        </div>
      )}

      {!loading && datos.length > 0 && (
        <div className={styles.reporteContainer}>
          <div className={styles.reporteHeader}>
            <h2>{getTituloReporte()}</h2>
            <p>Total de registros: <strong>{datos.length}</strong></p>
          </div>

          <div className={styles.tableContainer}>
            {renderTabla()}
          </div>
        </div>
      )}

      {!loading && datos.length === 0 && tipoReporte && (
        <div className={styles.noData}>
          <p>📭 No hay datos disponibles para el periodo seleccionado</p>
        </div>
      )}
    </div>
  );
};

export default ReporteVentas;