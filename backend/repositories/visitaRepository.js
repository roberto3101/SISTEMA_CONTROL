import { pool } from '../config/db.js';

class VisitaRepository {
  
  // Crear visita
  async create(visitaData) {
    try {
      const {
        id_vendedor,
        id_cliente,
        fecha_visita,
        tipo_visita,
        estado,
        observaciones,
        resultado
      } = visitaData;

      const [result] = await pool.query(`
        INSERT INTO visitas 
        (id_vendedor, id_cliente, fecha_visita, tipo_visita, estado, observaciones, resultado) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        id_vendedor,
        id_cliente,
        fecha_visita,
        tipo_visita || 'seguimiento',
        estado || 'programada',
        observaciones || null,
        resultado || null
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear visita: ${error.message}`);
    }
  }

  // Obtener todas las visitas
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion,
          u.nombre_completo as vendedor_nombre
        FROM visitas v
        INNER JOIN clientes c ON v.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON v.id_vendedor = u.id_usuario
        ORDER BY v.fecha_visita DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al listar visitas: ${error.message}`);
    }
  }

  // Obtener visita por ID
  async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion,
          u.nombre_completo as vendedor_nombre
        FROM visitas v
        INNER JOIN clientes c ON v.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON v.id_vendedor = u.id_usuario
        WHERE v.id_visita = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener visita: ${error.message}`);
    }
  }

  // Obtener visitas por vendedor
  async findByVendedor(vendedorId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion
        FROM visitas v
        INNER JOIN clientes c ON v.id_cliente = c.id_cliente
        WHERE v.id_vendedor = ?
        ORDER BY v.fecha_visita DESC
      `, [vendedorId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener visitas del vendedor: ${error.message}`);
    }
  }

  // Obtener visitas por cliente
  async findByCliente(clienteId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.*,
          u.nombre_completo as vendedor_nombre
        FROM visitas v
        INNER JOIN usuarios u ON v.id_vendedor = u.id_usuario
        WHERE v.id_cliente = ?
        ORDER BY v.fecha_visita DESC
      `, [clienteId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener visitas del cliente: ${error.message}`);
    }
  }

  // Actualizar visita
  async update(id, visitaData) {
    try {
      const {
        fecha_visita,
        tipo_visita,
        estado,
        observaciones,
        resultado
      } = visitaData;

      await pool.query(`
        UPDATE visitas 
        SET fecha_visita = ?,
            tipo_visita = ?,
            estado = ?,
            observaciones = ?,
            resultado = ?
        WHERE id_visita = ?
      `, [
        fecha_visita,
        tipo_visita,
        estado,
        observaciones,
        resultado,
        id
      ]);

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar visita: ${error.message}`);
    }
  }

  // Eliminar visita
  async delete(id) {
    try {
      await pool.query('DELETE FROM visitas WHERE id_visita = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar visita: ${error.message}`);
    }
  }

  // Actualizar estado de visita
  async updateEstado(id, estado, resultado = null) {
    try {
      await pool.query(
        'UPDATE visitas SET estado = ?, resultado = ? WHERE id_visita = ?',
        [estado, resultado, id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar estado de visita: ${error.message}`);
    }
  }

}

export default new VisitaRepository();