import { pool } from '../config/db.js';

class PedidoRepository {
  
  // Crear pedido con detalles
  async create(pedidoData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        id_vendedor,
        id_cliente,
        id_visita,
        subtotal,
        igv,
        total,
        observaciones,
        productos // Array de { id_producto, cantidad, precio_unitario, subtotal }
      } = pedidoData;

      // Insertar pedido
      const [pedidoResult] = await connection.query(`
        INSERT INTO pedidos 
        (id_vendedor, id_cliente, id_visita, subtotal, igv, total, observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id_vendedor, id_cliente, id_visita || null, subtotal, igv, total, observaciones || null]);

      const pedidoId = pedidoResult.insertId;

      // Insertar detalles del pedido
      for (const producto of productos) {
        await connection.query(`
          INSERT INTO detalle_pedido 
          (id_pedido, id_producto, cantidad, precio_unitario, subtotal) 
          VALUES (?, ?, ?, ?, ?)
        `, [
          pedidoId,
          producto.id_producto,
          producto.cantidad,
          producto.precio_unitario,
          producto.subtotal
        ]);

        // Actualizar stock del producto
        await connection.query(`
          UPDATE productos 
          SET stock_actual = stock_actual - ? 
          WHERE id_producto = ?
        `, [producto.cantidad, producto.id_producto]);
      }

      await connection.commit();
      return pedidoId;

    } catch (error) {
      await connection.rollback();
      throw new Error(`Error al crear pedido: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Obtener todos los pedidos con detalles
  async findAll() {
    try {
      const [pedidos] = await pool.query(`
        SELECT 
          p.*,
          c.nombre_negocio,
          c.nombre_contacto,
          u.nombre_completo as vendedor_nombre
        FROM pedidos p
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON p.id_vendedor = u.id_usuario
        ORDER BY p.fecha_pedido DESC
      `);
      return pedidos;
    } catch (error) {
      throw new Error(`Error al listar pedidos: ${error.message}`);
    }
  }

  // Obtener pedido por ID con detalles
  async findById(id) {
    try {
      const [pedidos] = await pool.query(`
        SELECT 
          p.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion,
          u.nombre_completo as vendedor_nombre
        FROM pedidos p
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON p.id_vendedor = u.id_usuario
        WHERE p.id_pedido = ?
      `, [id]);

      if (pedidos.length === 0) {
        return null;
      }

      const pedido = pedidos[0];

      // Obtener detalles del pedido
      const [detalles] = await pool.query(`
        SELECT 
          dp.*,
          pr.codigo,
          pr.nombre,
          pr.unidad_medida
        FROM detalle_pedido dp
        INNER JOIN productos pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = ?
      `, [id]);

      pedido.detalles = detalles;
      return pedido;

    } catch (error) {
      throw new Error(`Error al obtener pedido: ${error.message}`);
    }
  }

  // Obtener pedidos por vendedor
  async findByVendedor(vendedorId) {
    try {
      const [pedidos] = await pool.query(`
        SELECT 
          p.*,
          c.nombre_negocio,
          c.nombre_contacto
        FROM pedidos p
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente
        WHERE p.id_vendedor = ?
        ORDER BY p.fecha_pedido DESC
      `, [vendedorId]);
      return pedidos;
    } catch (error) {
      throw new Error(`Error al obtener pedidos del vendedor: ${error.message}`);
    }
  }

  // Actualizar estado del pedido
  async updateEstado(id, estado) {
    try {
      await pool.query(
        'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
        [estado, id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar estado del pedido: ${error.message}`);
    }
  }

}

export default new PedidoRepository();