import { pool } from '../config/db.js';

class ProductoRepository {
  
  // Listar todos los productos
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM productos 
        WHERE estado = 'activo'
        ORDER BY nombre ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al listar productos: ${error.message}`);
    }
  }

  // Buscar producto por ID
  async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM productos WHERE id_producto = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar producto: ${error.message}`);
    }
  }

  // Buscar producto por código
  async findByCodigo(codigo) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM productos WHERE codigo = ?',
        [codigo]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar producto por código: ${error.message}`);
    }
  }

  // Buscar productos por término de búsqueda
  async search(searchTerm) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM productos 
        WHERE (nombre LIKE ? OR codigo LIKE ? OR descripcion LIKE ?)
        AND estado = 'activo'
        ORDER BY nombre ASC
      `, [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ]);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  // Obtener productos con stock bajo
  async getStockBajo() {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM productos 
        WHERE stock_actual <= stock_minimo 
        AND estado = 'activo'
        ORDER BY stock_actual ASC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
    }
  }

  // Actualizar stock de producto
  async updateStock(id, cantidad, operacion = 'restar') {
    try {
      if (operacion === 'restar') {
        await pool.query(
          'UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?',
          [cantidad, id]
        );
      } else {
        await pool.query(
          'UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?',
          [cantidad, id]
        );
      }
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }

  // Verificar disponibilidad de stock
  async verificarStock(id, cantidadRequerida) {
    try {
      const [rows] = await pool.query(
        'SELECT stock_actual FROM productos WHERE id_producto = ?',
        [id]
      );

      if (rows.length === 0) {
        return { disponible: false, mensaje: 'Producto no encontrado' };
      }

      const stockActual = rows[0].stock_actual;

      if (stockActual >= cantidadRequerida) {
        return { 
          disponible: true, 
          stockActual, 
          mensaje: 'Stock disponible' 
        };
      } else {
        return { 
          disponible: false, 
          stockActual, 
          mensaje: `Stock insuficiente. Disponible: ${stockActual}` 
        };
      }
    } catch (error) {
      throw new Error(`Error al verificar stock: ${error.message}`);
    }
  }

  // Crear nuevo producto (NUEVO)
  async create(productoData) {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        precio_unitario,
        stock_actual,
        stock_minimo,
        unidad_medida
      } = productoData;

      const [result] = await pool.query(`
        INSERT INTO productos 
        (codigo, nombre, descripcion, precio_unitario, stock_actual, stock_minimo, unidad_medida) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        codigo,
        nombre,
        descripcion || null,
        precio_unitario,
        stock_actual || 0,
        stock_minimo || 10,
        unidad_medida || 'UNIDAD'
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  // Actualizar producto (NUEVO)
  async update(id, productoData) {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        precio_unitario,
        stock_actual,
        stock_minimo,
        unidad_medida,
        estado
      } = productoData;

      await pool.query(`
        UPDATE productos 
        SET codigo = ?,
            nombre = ?,
            descripcion = ?,
            precio_unitario = ?,
            stock_actual = ?,
            stock_minimo = ?,
            unidad_medida = ?,
            estado = ?
        WHERE id_producto = ?
      `, [
        codigo,
        nombre,
        descripcion,
        precio_unitario,
        stock_actual,
        stock_minimo,
        unidad_medida,
        estado,
        id
      ]);

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  // Eliminar producto (NUEVO)
  async delete(id) {
    try {
      await pool.query(
        'UPDATE productos SET estado = "inactivo" WHERE id_producto = ?',
        [id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

}

export default new ProductoRepository();