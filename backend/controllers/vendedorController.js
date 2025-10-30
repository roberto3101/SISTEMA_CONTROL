import vendedorRepository from '../repositories/vendedorRepository.js';
import bcrypt from 'bcryptjs';

class VendedorController {

  // Listar todos los vendedores
  async getAll(req, res) {
    try {
      const vendedores = await vendedorRepository.findAll();

      res.json({
        success: true,
        data: { vendedores }
      });
    } catch (error) {
      console.error('Error al listar vendedores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar vendedores',
        error: error.message
      });
    }
  }

  // Obtener vendedor por ID con detalles completos
  async getById(req, res) {
    try {
      const { id } = req.params;
      const vendedor = await vendedorRepository.findByIdWithDetails(id);

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado'
        });
      }

      res.json({
        success: true,
        data: { vendedor }
      });
    } catch (error) {
      console.error('Error al obtener vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vendedor',
        error: error.message
      });
    }
  }

  // Crear vendedor
  async create(req, res) {
    try {
      const { nombre_completo, email, password } = req.body;

      // Validaciones
      if (!nombre_completo || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const vendedorId = await vendedorRepository.create({
        nombre_completo,
        email,
        password: hashedPassword
      });

      const nuevoVendedor = await vendedorRepository.findById(vendedorId);

      res.status(201).json({
        success: true,
        message: 'Vendedor creado exitosamente',
        data: { vendedor: nuevoVendedor }
      });

    } catch (error) {
      console.error('Error al crear vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear vendedor',
        error: error.message
      });
    }
  }

  // Actualizar vendedor
  async update(req, res) {
    try {
      const { id } = req.params;
      const vendedorData = req.body;

      const vendedorExistente = await vendedorRepository.findById(id);
      if (!vendedorExistente) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado'
        });
      }

      await vendedorRepository.update(id, vendedorData);
      const vendedorActualizado = await vendedorRepository.findById(id);

      res.json({
        success: true,
        message: 'Vendedor actualizado exitosamente',
        data: { vendedor: vendedorActualizado }
      });
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar vendedor',
        error: error.message
      });
    }
  }

  // Cambiar estado
  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['activo', 'inactivo', 'bloqueado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      await vendedorRepository.updateEstado(id, estado);

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  }

  // Eliminar vendedor (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const vendedor = await vendedorRepository.findById(id);
      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado'
        });
      }

      await vendedorRepository.delete(id);

      res.json({
        success: true,
        message: 'Vendedor eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar vendedor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas generales de vendedores
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await vendedorRepository.getEstadisticasGenerales();

      res.json({
        success: true,
        data: { estadisticas }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

}

export default new VendedorController();