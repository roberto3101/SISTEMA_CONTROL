import { pool } from '../config/db.js';

class VendedorRepository {
  
  // Obtener todos los vendedores
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id_usuario,
          nombre_completo,
          email,
          rol,
          estado,
          fecha_creacion
        FROM usuarios 
        WHERE rol = 'vendedor'
        ORDER BY nombre_completo ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al listar vendedores: ${error.message}`);
    }
  }

  // Obtener vendedor por ID con detalles completos
  async findByIdWithDetails(id) {
    try {
      // Información básica del vendedor
      const [vendedor] = await pool.query(`
        SELECT 
          id_usuario,
          nombre_completo,
          email,
          rol,
          estado,
          fecha_creacion
        FROM usuarios 
        WHERE id_usuario = ? AND rol = 'vendedor'
      `, [id]);

      if (vendedor.length === 0) {
        return null;
      }

      const vendedorData = vendedor[0];

      // Clientes asignados
      const [clientes] = await pool.query(`
        SELECT 
          c.id_cliente,
          c.nombre_negocio,
          c.nombre_contacto,
          c.telefono,
          c.direccion,
          c.distrito,
          ac.fecha_asignacion
        FROM asignacion_clientes ac
        INNER JOIN clientes c ON ac.id_cliente = c.id_cliente
        WHERE ac.id_vendedor = ? AND ac.estado = 'activo' AND c.estado = 'activo'
        ORDER BY c.nombre_negocio ASC
      `, [id]);

      // Pedidos realizados
      const [pedidos] = await pool.query(`
        SELECT 
          COUNT(*) as total_pedidos,
          SUM(CASE WHEN estado = 'registrado' THEN 1 ELSE 0 END) as pedidos_registrados,
          SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as pedidos_confirmados,
          SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as pedidos_entregados,
          SUM(CASE WHEN estado = 'anulado' THEN 1 ELSE 0 END) as pedidos_anulados,
          COALESCE(SUM(total), 0) as monto_total_vendido
        FROM pedidos
        WHERE id_vendedor = ?
      `, [id]);

      // Visitas realizadas
      const [visitas] = await pool.query(`
        SELECT 
          COUNT(*) as total_visitas,
          SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as visitas_programadas,
          SUM(CASE WHEN estado = 'realizada' THEN 1 ELSE 0 END) as visitas_realizadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as visitas_canceladas
        FROM visitas
        WHERE id_vendedor = ?
      `, [id]);

      // Pedidos recientes (últimos 10)
      const [pedidosRecientes] = await pool.query(`
        SELECT 
          p.id_pedido,
          p.fecha_pedido,
          p.total,
          p.estado,
          c.nombre_negocio
        FROM pedidos p
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente
        WHERE p.id_vendedor = ?
        ORDER BY p.fecha_pedido DESC
        LIMIT 10
      `, [id]);

      // Visitas recientes (últimas 10)
      const [visitasRecientes] = await pool.query(`
        SELECT 
          v.id_visita,
          v.fecha_visita,
          v.tipo_visita,
          v.estado,
          c.nombre_negocio
        FROM visitas v
        INNER JOIN clientes c ON v.id_cliente = c.id_cliente
        WHERE v.id_vendedor = ?
        ORDER BY v.fecha_visita DESC
        LIMIT 10
      `, [id]);

      return {
        ...vendedorData,
        clientes_asignados: clientes,
        estadisticas: {
          total_clientes: clientes.length,
          total_pedidos: pedidos[0].total_pedidos || 0,
          pedidos_registrados: pedidos[0].pedidos_registrados || 0,
          pedidos_confirmados: pedidos[0].pedidos_confirmados || 0,
          pedidos_entregados: pedidos[0].pedidos_entregados || 0,
          pedidos_anulados: pedidos[0].pedidos_anulados || 0,
          monto_total_vendido: parseFloat(pedidos[0].monto_total_vendido || 0),
          total_visitas: visitas[0].total_visitas || 0,
          visitas_programadas: visitas[0].visitas_programadas || 0,
          visitas_realizadas: visitas[0].visitas_realizadas || 0,
          visitas_canceladas: visitas[0].visitas_canceladas || 0
        },
        pedidos_recientes: pedidosRecientes,
        visitas_recientes: visitasRecientes
      };

    } catch (error) {
      throw new Error(`Error al obtener detalles del vendedor: ${error.message}`);
    }
  }

  // Obtener vendedor básico por ID
  async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id_usuario,
          nombre_completo,
          email,
          estado,
          fecha_creacion
        FROM usuarios 
        WHERE id_usuario = ? AND rol = 'vendedor'
      `, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar vendedor: ${error.message}`);
    }
  }

  // Crear vendedor (ya existe en authRepository, pero podemos reutilizar)
  async create(vendedorData) {
    try {
      const { nombre_completo, email, password } = vendedorData;
      
      const [result] = await pool.query(`
        INSERT INTO usuarios (nombre_completo, email, password, rol) 
        VALUES (?, ?, ?, 'vendedor')
      `, [nombre_completo, email, password]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear vendedor: ${error.message}`);
    }
  }

  // Actualizar vendedor
  async update(id, vendedorData) {
    try {
      const { nombre_completo, email, estado } = vendedorData;

      await pool.query(`
        UPDATE usuarios 
        SET nombre_completo = ?,
            email = ?,
            estado = ?
        WHERE id_usuario = ? AND rol = 'vendedor'
      `, [nombre_completo, email, estado, id]);

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar vendedor: ${error.message}`);
    }
  }

  // Cambiar estado del vendedor
  async updateEstado(id, estado) {
    try {
      await pool.query(
        'UPDATE usuarios SET estado = ? WHERE id_usuario = ? AND rol = "vendedor"',
        [estado, id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al cambiar estado del vendedor: ${error.message}`);
    }
  }

  // Eliminar vendedor (soft delete)
  async delete(id) {
    try {
      await pool.query(
        'UPDATE usuarios SET estado = "inactivo" WHERE id_usuario = ? AND rol = "vendedor"',
        [id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar vendedor: ${error.message}`);
    }
  }

  // Obtener estadísticas generales de todos los vendedores
  async getEstadisticasGenerales() {
    try {
      const [stats] = await pool.query(`
        SELECT 
          u.id_usuario,
          u.nombre_completo,
          u.estado,
          COUNT(DISTINCT ac.id_cliente) as total_clientes,
          COUNT(DISTINCT p.id_pedido) as total_pedidos,
          COALESCE(SUM(p.total), 0) as monto_total_vendido,
          COUNT(DISTINCT v.id_visita) as total_visitas
        FROM usuarios u
        LEFT JOIN asignacion_clientes ac ON u.id_usuario = ac.id_vendedor AND ac.estado = 'activo'
        LEFT JOIN pedidos p ON u.id_usuario = p.id_vendedor
        LEFT JOIN visitas v ON u.id_usuario = v.id_vendedor
        WHERE u.rol = 'vendedor'
        GROUP BY u.id_usuario, u.nombre_completo, u.estado
        ORDER BY monto_total_vendido DESC
      `);
      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
    }
  }

}

export default new VendedorRepository();