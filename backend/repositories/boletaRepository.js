import { pool } from '../config/db.js';

class BoletaRepository {
  
  // Generar número de boleta automático
  async generateNumeroBoleta() {
    try {
      const [rows] = await pool.query(`
        SELECT numero_boleta 
        FROM boletas 
        ORDER BY id_boleta DESC 
        LIMIT 1
      `);

      if (rows.length === 0) {
        return 'B001-00001';
      }

      const ultimaBoleta = rows[0].numero_boleta;
      const [serie, numero] = ultimaBoleta.split('-');
      const nuevoNumero = (parseInt(numero) + 1).toString().padStart(5, '0');
      
      return `${serie}-${nuevoNumero}`;
    } catch (error) {
      throw new Error(`Error al generar número de boleta: ${error.message}`);
    }
  }

  // Crear boleta desde un pedido
  async create(boletaData) {
    try {
      const {
        numero_boleta,
        id_pedido,
        id_vendedor,
        id_cliente,
        subtotal,
        igv,
        total,
        id_auxiliar
      } = boletaData;

      const [result] = await pool.query(`
        INSERT INTO boletas 
        (numero_boleta, id_pedido, id_vendedor, id_cliente, subtotal, igv, total, estado, id_auxiliar, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'registrada', ?, NOW())
      `, [numero_boleta, id_pedido, id_vendedor, id_cliente, subtotal, igv, total, id_auxiliar]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear boleta: ${error.message}`);
    }
  }

  // Obtener todas las boletas
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          b.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          v.nombre_completo as vendedor_nombre,
          a.nombre_completo as auxiliar_nombre,
          p.estado as estado_pedido
        FROM boletas b
        INNER JOIN clientes c ON b.id_cliente = c.id_cliente
        INNER JOIN usuarios v ON b.id_vendedor = v.id_usuario
        LEFT JOIN usuarios a ON b.id_auxiliar = a.id_usuario
        INNER JOIN pedidos p ON b.id_pedido = p.id_pedido
        ORDER BY b.fecha_emision DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al listar boletas: ${error.message}`);
    }
  }

  // Obtener boleta por ID con detalles
  async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          b.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion,
          c.distrito,
          v.nombre_completo as vendedor_nombre,
          a.nombre_completo as auxiliar_nombre
        FROM boletas b
        INNER JOIN clientes c ON b.id_cliente = c.id_cliente
        INNER JOIN usuarios v ON b.id_vendedor = v.id_usuario
        LEFT JOIN usuarios a ON b.id_auxiliar = a.id_usuario
        WHERE b.id_boleta = ?
      `, [id]);

      if (rows.length === 0) return null;

      const boleta = rows[0];

      // Obtener detalles del pedido
      const [detalles] = await pool.query(`
        SELECT 
          dp.*,
          p.nombre as producto_nombre,
          p.codigo as producto_codigo
        FROM detalle_pedido dp
        INNER JOIN productos p ON dp.id_producto = p.id_producto
        WHERE dp.id_pedido = ?
      `, [boleta.id_pedido]);

      boleta.detalles = detalles;

      return boleta;
    } catch (error) {
      throw new Error(`Error al obtener boleta: ${error.message}`);
    }
  }

  // Obtener boleta por número
  async findByNumero(numeroBoleta) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM boletas WHERE numero_boleta = ?
      `, [numeroBoleta]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar boleta: ${error.message}`);
    }
  }

  // Verificar si un pedido ya tiene boleta
  async findByPedido(idPedido) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM boletas WHERE id_pedido = ? AND estado != 'anulada'
      `, [idPedido]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar boleta por pedido: ${error.message}`);
    }
  }

  // Actualizar estado de boleta
  async updateEstado(id, estado) {
    try {
      await pool.query(
        'UPDATE boletas SET estado = ? WHERE id_boleta = ?',
        [estado, id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  // Anular boleta
  async anular(id, motivoAnulacion, idUsuario) {
    try {
      await pool.query(`
        UPDATE boletas 
        SET estado = 'anulada',
            motivo_anulacion = ?,
            fecha_anulacion = NOW()
        WHERE id_boleta = ?
      `, [motivoAnulacion, id]);
      return true;
    } catch (error) {
      throw new Error(`Error al anular boleta: ${error.message}`);
    }
  }

  // Modificar boleta (cambiar a emitida)
  async emitir(id) {
    try {
      await pool.query(`
        UPDATE boletas 
        SET estado = 'emitida'
        WHERE id_boleta = ?
      `, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al emitir boleta: ${error.message}`);
    }
  }

}

export default new BoletaRepository();