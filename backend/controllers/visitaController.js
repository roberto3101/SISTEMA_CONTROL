import visitaRepository from '../repositories/visitaRepository.js';

class VisitaController {

  // Crear visita
  async create(req, res) {
    try {
      const visitaData = req.body;
      const vendedorId = req.user.id; // Del token JWT

      // Validaciones
      if (!visitaData.id_cliente || !visitaData.fecha_visita) {
        return res.status(400).json({
          success: false,
          message: 'Cliente y fecha son requeridos'
        });
      }

      // Agregar id_vendedor del usuario autenticado
      visitaData.id_vendedor = vendedorId;

      const visitaId = await visitaRepository.create(visitaData);
      const nuevaVisita = await visitaRepository.findById(visitaId);

      res.status(201).json({
        success: true,
        message: 'Visita registrada exitosamente',
        data: { visita: nuevaVisita }
      });

    } catch (error) {
      console.error('Error al crear visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear visita',
        error: error.message
      });
    }
  }

  // Listar todas las visitas
  async getAll(req, res) {
    try {
      const visitas = await visitaRepository.findAll();

      res.json({
        success: true,
        data: { visitas }
      });
    } catch (error) {
      console.error('Error al listar visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar visitas',
        error: error.message
      });
    }
  }

  // Obtener visita por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const visita = await visitaRepository.findById(id);

      if (!visita) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }

      res.json({
        success: true,
        data: { visita }
      });
    } catch (error) {
      console.error('Error al obtener visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visita',
        error: error.message
      });
    }
  }

  // Obtener visitas del vendedor autenticado
  async getMisVisitas(req, res) {
    try {
      const vendedorId = req.user.id;
      const visitas = await visitaRepository.findByVendedor(vendedorId);

      res.json({
        success: true,
        data: { visitas }
      });
    } catch (error) {
      console.error('Error al obtener visitas del vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visitas',
        error: error.message
      });
    }
  }

  // Obtener visitas por cliente
  async getByCliente(req, res) {
    try {
      const { id } = req.params;
      const visitas = await visitaRepository.findByCliente(id);

      res.json({
        success: true,
        data: { visitas }
      });
    } catch (error) {
      console.error('Error al obtener visitas del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visitas del cliente',
        error: error.message
      });
    }
  }

  // Actualizar visita
  async update(req, res) {
    try {
      const { id } = req.params;
      const visitaData = req.body;

      const visitaExistente = await visitaRepository.findById(id);
      if (!visitaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }

      await visitaRepository.update(id, visitaData);
      const visitaActualizada = await visitaRepository.findById(id);

      res.json({
        success: true,
        message: 'Visita actualizada exitosamente',
        data: { visita: visitaActualizada }
      });
    } catch (error) {
      console.error('Error al actualizar visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar visita',
        error: error.message
      });
    }
  }

  // Actualizar estado de visita
  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, resultado } = req.body;

      const estadosValidos = ['programada', 'realizada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      await visitaRepository.updateEstado(id, estado, resultado);

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

  // Eliminar visita
  async delete(req, res) {
    try {
      const { id } = req.params;

      const visita = await visitaRepository.findById(id);
      if (!visita) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }

      await visitaRepository.delete(id);

      res.json({
        success: true,
        message: 'Visita eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar visita',
        error: error.message
      });
    }
  }

}

export default new VisitaController();