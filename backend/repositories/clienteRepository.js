import { pool } from '../config/db.js';

class ClienteRepository {
  
  // Listar todos los clientes
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          c.*,
          COUNT(DISTINCT ac.id_vendedor) as vendedores_asignados
        FROM clientes c
        LEFT JOIN asignacion_clientes ac ON c.id_cliente = ac.id_cliente AND ac.estado = 'activo'
        GROUP BY c.id_cliente
        ORDER BY c.fecha_registro DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al listar clientes: ${error.message}`);
    }
  }

  // Buscar cliente por ID
  async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE id_cliente = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar cliente: ${error.message}`);
    }
  }

  // Buscar clientes por término de búsqueda
  async search(searchTerm) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM clientes 
        WHERE nombre_negocio LIKE ? 
        OR nombre_contacto LIKE ? 
        OR telefono LIKE ?
        OR distrito LIKE ?
        ORDER BY nombre_negocio ASC
      `, [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ]);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar clientes: ${error.message}`);
    }
  }

  // Crear nuevo cliente
  async create(clienteData) {
    try {
      const {
        nombre_negocio,
        nombre_contacto,
        telefono,
        direccion,
        distrito,
        referencia,
        tiene_deuda
      } = clienteData;

      const [result] = await pool.query(`
        INSERT INTO clientes 
        (nombre_negocio, nombre_contacto, telefono, direccion, distrito, referencia, tiene_deuda) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        nombre_negocio,
        nombre_contacto,
        telefono || null,
        direccion || null,
        distrito || null,
        referencia || null,
        tiene_deuda || false
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  // Actualizar cliente
  async update(id, clienteData) {
    try {
      const {
        nombre_negocio,
        nombre_contacto,
        telefono,
        direccion,
        distrito,
        referencia,
        tiene_deuda,
        estado
      } = clienteData;

      await pool.query(`
        UPDATE clientes 
        SET nombre_negocio = ?,
            nombre_contacto = ?,
            telefono = ?,
            direccion = ?,
            distrito = ?,
            referencia = ?,
            tiene_deuda = ?,
            estado = ?
        WHERE id_cliente = ?
      `, [
        nombre_negocio,
        nombre_contacto,
        telefono || null,
        direccion || null,
        distrito || null,
        referencia || null,
        tiene_deuda,
        estado,
        id
      ]);

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  // Eliminar cliente (soft delete)
  async delete(id) {
    try {
      await pool.query(
        'UPDATE clientes SET estado = "inactivo" WHERE id_cliente = ?',
        [id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  // Obtener clientes asignados a un vendedor
  async findByVendedor(vendedorId) {
    try {
      const [rows] = await pool.query(`
        SELECT c.* 
        FROM clientes c
        INNER JOIN asignacion_clientes ac ON c.id_cliente = ac.id_cliente
        WHERE ac.id_vendedor = ? AND ac.estado = 'activo'
        ORDER BY c.nombre_negocio ASC
      `, [vendedorId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener clientes del vendedor: ${error.message}`);
    }
  }

}

export default new ClienteRepository();