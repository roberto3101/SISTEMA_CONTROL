import { pool } from '../config/db.js';

class UserRepository {
  
  // Buscar usuario por email
  async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // Buscar usuario por ID
  async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id_usuario, nombre_completo, email, rol, estado, fecha_creacion FROM usuarios WHERE id_usuario = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // Crear nuevo usuario
  async create(userData) {
    try {
      const { nombre_completo, email, password, rol } = userData;
      const [result] = await pool.query(
        'INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre_completo, email, password, rol]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El email ya está registrado');
      }
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Actualizar intentos fallidos
  async updateFailedAttempts(userId, attempts) {
    try {
      await pool.query(
        'UPDATE usuarios SET intentos_fallidos = ? WHERE id_usuario = ?',
        [attempts, userId]
      );
    } catch (error) {
      throw new Error(`Error al actualizar intentos: ${error.message}`);
    }
  }

  // Bloquear cuenta
  async blockAccount(userId) {
    try {
      await pool.query(
        'UPDATE usuarios SET estado = "bloqueado" WHERE id_usuario = ?',
        [userId]
      );
    } catch (error) {
      throw new Error(`Error al bloquear cuenta: ${error.message}`);
    }
  }

  // Listar todos los usuarios (para admin)
  async findAll() {
    try {
      const [rows] = await pool.query(
        'SELECT id_usuario, nombre_completo, email, rol, estado, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error.message}`);
    }
  }

}

export default new UserRepository();