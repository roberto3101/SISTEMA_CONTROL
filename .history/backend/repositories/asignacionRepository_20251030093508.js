import { pool } from '../config/db.js';

class AsignacionRepository {
  
  // Obtener todas las asignaciones
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          ac.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.distrito,
          c.telefono,
          u.nombre_completo as vendedor_nombre,
          u.email as vendedor_email
        FROM asignacion_clientes ac
        INNER JOIN clientes c ON ac.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON ac.id_vendedor = u.id_usuario
        WHERE ac.estado = 'activo'
        ORDER BY ac.fecha_asignacion DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener asignaciones: ${error.message}`);
    }
  }

  // Obtener clientes sin asignar
  async getClientesSinAsignar() {
    try {
      const [rows] = await pool.query(`
        SELECT c.* 
        FROM clientes c
        WHERE c.estado = 'activo'
        AND c.id_cliente NOT IN (
          SELECT id_cliente 
          FROM asignacion_clientes 
          WHERE estado = 'activo'
        )
        ORDER BY c.nombre_negocio ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener clientes sin asignar: ${error.message}`);
    }
  }

  // Obtener vendedores disponibles
  async getVendedoresDisponibles() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.id_usuario,
          u.nombre_completo,
          u.email,
          COUNT(ac.id_asignacion) as total_clientes
        FROM usuarios u
        LEFT JOIN asignacion_clientes ac ON u.id_usuario = ac.id_vendedor AND ac.estado = 'activo'
        WHERE u.rol = 'vendedor' AND u.estado = 'activo'
        GROUP BY u.id_usuario, u.nombre_completo, u.email
        ORDER BY total_clientes ASC, u.nombre_completo ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener vendedores: ${error.message}`);
    }
  }

// Asignar cliente a vendedor
async asignar(idVendedor, idCliente) {
  try {
    // Verificar si ya existe una asignación activa
    const [existing] = await pool.query(
      'SELECT * FROM asignacion_clientes WHERE id_cliente = ? AND estado = "activo"',
      [idCliente]
    );

    if (existing.length > 0) {
      throw new Error('El cliente ya está asignado a un vendedor');
    }

    // Eliminar asignaciones inactivas anteriores del mismo vendedor-cliente
    await pool.query(
      'DELETE FROM asignacion_clientes WHERE id_vendedor = ? AND id_cliente = ? AND estado = "inactivo"',
      [idVendedor, idCliente]
    );

    const [result] = await pool.query(
      'INSERT INTO asignacion_clientes (id_vendedor, id_cliente) VALUES (?, ?)',
      [idVendedor, idCliente]
    );

    return result.insertId;
  } catch (error) {
    throw new Error(`Error al asignar cliente: ${error.message}`);
  }
}
// Reasignar cliente a otro vendedor
async reasignar(idAsignacion, nuevoIdVendedor) {
  try {
    // Obtener el cliente de la asignación
    const [asignacion] = await pool.query(
      'SELECT id_cliente FROM asignacion_clientes WHERE id_asignacion = ?',
      [idAsignacion]
    );

    if (asignacion.length === 0) {
      throw new Error('Asignación no encontrada');
    }

    // Eliminar asignación anterior
    await pool.query(
      'DELETE FROM asignacion_clientes WHERE id_asignacion = ?',
      [idAsignacion]
    );

    // Crear nueva asignación
    const [result] = await pool.query(
      'INSERT INTO asignacion_clientes (id_vendedor, id_cliente) VALUES (?, ?)',
      [nuevoIdVendedor, asignacion[0].id_cliente]
    );

    return result.insertId;
  } catch (error) {
    throw new Error(`Error al reasignar cliente: ${error.message}`);
  }
}

  // Quitar asignación
  async quitar(idAsignacion) {
    try {
      await pool.query(
        'UPDATE asignacion_clientes SET estado = "inactivo" WHERE id_asignacion = ?',
        [idAsignacion]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al quitar asignación: ${error.message}`);
    }
  }

  // Obtener asignaciones de un vendedor específico
  async getByVendedor(idVendedor) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          ac.*,
          c.nombre_negocio,
          c.nombre_contacto,
          c.distrito,
          c.telefono,
          c.direccion
        FROM asignacion_clientes ac
        INNER JOIN clientes c ON ac.id_cliente = c.id_cliente
        WHERE ac.id_vendedor = ? AND ac.estado = 'activo'
        ORDER BY c.nombre_negocio ASC
      `, [idVendedor]);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener asignaciones del vendedor: ${error.message}`);
    }
  }

}

export default new AsignacionRepository();