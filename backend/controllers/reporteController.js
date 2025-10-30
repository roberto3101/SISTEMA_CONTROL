import pedidoRepository from '../repositories/pedidoRepository.js';
import boletaRepository from '../repositories/boletaRepository.js';
import { pool } from '../config/db.js';

class ReporteController {

  // Reporte de ventas por periodo
  async getVentasPorPeriodo(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar fecha de inicio y fin'
        });
      }

      const [ventas] = await pool.query(`
        SELECT 
          DATE(p.fecha_pedido) as fecha,
          COUNT(p.id_pedido) as total_pedidos,
          SUM(p.total) as monto_total,
          SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) as monto_entregado,
          COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) as pedidos_entregados,
          COUNT(CASE WHEN p.estado = 'anulado' THEN 1 END) as pedidos_anulados
        FROM pedidos p
        WHERE DATE(p.fecha_pedido) BETWEEN ? AND ?
        GROUP BY DATE(p.fecha_pedido)
        ORDER BY fecha DESC
      `, [fecha_inicio, fecha_fin]);

      res.json({
        success: true,
        data: { ventas }
      });

    } catch (error) {
      console.error('Error en reporte de ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

  // Reporte de ventas por vendedor
  async getVentasPorVendedor(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      const [vendedores] = await pool.query(`
        SELECT 
          u.id_usuario,
          u.nombre_completo as vendedor,
          COUNT(p.id_pedido) as total_pedidos,
          SUM(p.total) as monto_total,
          COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) as pedidos_entregados,
          SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) as monto_entregado,
          COUNT(DISTINCT p.id_cliente) as clientes_atendidos
        FROM usuarios u
        LEFT JOIN pedidos p ON u.id_usuario = p.id_vendedor 
          ${fecha_inicio && fecha_fin ? 'AND DATE(p.fecha_pedido) BETWEEN ? AND ?' : ''}
        WHERE u.rol = 'vendedor'
        GROUP BY u.id_usuario, u.nombre_completo
        ORDER BY monto_total DESC
      `, fecha_inicio && fecha_fin ? [fecha_inicio, fecha_fin] : []);

      res.json({
        success: true,
        data: { vendedores }
      });

    } catch (error) {
      console.error('Error en reporte de vendedores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

  // Reporte de productos más vendidos
  async getProductosMasVendidos(req, res) {
    try {
      const { fecha_inicio, fecha_fin, limit = 10 } = req.query;

      const [productos] = await pool.query(`
        SELECT 
          pr.id_producto,
          pr.codigo,
          pr.nombre,
          SUM(dp.cantidad) as cantidad_vendida,
          SUM(dp.subtotal) as monto_total,
          COUNT(DISTINCT dp.id_pedido) as pedidos_count
        FROM productos pr
        INNER JOIN detalle_pedido dp ON pr.id_producto = dp.id_producto
        INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
        WHERE p.estado != 'anulado'
          ${fecha_inicio && fecha_fin ? 'AND DATE(p.fecha_pedido) BETWEEN ? AND ?' : ''}
        GROUP BY pr.id_producto, pr.codigo, pr.nombre
        ORDER BY cantidad_vendida DESC
        LIMIT ?
      `, fecha_inicio && fecha_fin ? [fecha_inicio, fecha_fin, parseInt(limit)] : [parseInt(limit)]);

      res.json({
        success: true,
        data: { productos }
      });

    } catch (error) {
      console.error('Error en reporte de productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

  // Reporte de clientes
  async getReporteClientes(req, res) {
    try {
      const [clientes] = await pool.query(`
        SELECT 
          c.id_cliente,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.distrito,
          COUNT(p.id_pedido) as total_pedidos,
          SUM(CASE WHEN p.estado != 'anulado' THEN p.total ELSE 0 END) as monto_total,
          MAX(p.fecha_pedido) as ultima_compra,
          u.nombre_completo as vendedor_asignado
        FROM clientes c
        LEFT JOIN pedidos p ON c.id_cliente = p.id_cliente
        LEFT JOIN asignacion_clientes ac ON c.id_cliente = ac.id_cliente AND ac.estado = 'activo'
        LEFT JOIN usuarios u ON ac.id_vendedor = u.id_usuario
        WHERE c.estado = 'activo'
        GROUP BY c.id_cliente
        ORDER BY monto_total DESC
      `);

      res.json({
        success: true,
        data: { clientes }
      });

    } catch (error) {
      console.error('Error en reporte de clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

  // Reporte de boletas emitidas
  async getReporteBoletas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      const [boletas] = await pool.query(`
        SELECT 
          b.numero_boleta,
          b.fecha_emision,
          b.total,
          b.estado,
          c.nombre_negocio,
          v.nombre_completo as vendedor,
          a.nombre_completo as auxiliar
        FROM boletas b
        INNER JOIN clientes c ON b.id_cliente = c.id_cliente
        INNER JOIN usuarios v ON b.id_vendedor = v.id_usuario
        LEFT JOIN usuarios a ON b.id_auxiliar = a.id_usuario
        WHERE 1=1
          ${fecha_inicio && fecha_fin ? 'AND DATE(b.fecha_emision) BETWEEN ? AND ?' : ''}
        ORDER BY b.fecha_emision DESC
      `, fecha_inicio && fecha_fin ? [fecha_inicio, fecha_fin] : []);

      res.json({
        success: true,
        data: { boletas }
      });

    } catch (error) {
      console.error('Error en reporte de boletas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

}

export default new ReporteController();