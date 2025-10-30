import asignacionRepository from '../repositories/asignacionRepository.js';

class AsignacionController {

  // Obtener todas las asignaciones
  async getAll(req, res) {
    try {
      const asignaciones = await asignacionRepository.findAll();
      
      res.json({
        success: true,
        data: { asignaciones }
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener asignaciones',
        error: error.message
      });
    }
  }

  // Obtener clientes sin asignar
  async getClientesSinAsignar(req, res) {
    try {
      const clientes = await asignacionRepository.getClientesSinAsignar();
      
      res.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      console.error('Error al obtener clientes sin asignar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clientes sin asignar',
        error: error.message
      });
    }
  }

  // Obtener vendedores disponibles
  async getVendedores(req, res) {
    try {
      const vendedores = await asignacionRepository.getVendedoresDisponibles();
      
      res.json({
        success: true,
        data: { vendedores }
      });
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vendedores',
        error: error.message
      });
    }
  }

  // Asignar cliente a vendedor
  async asignar(req, res) {
    try {
      const { id_vendedor, id_cliente } = req.body;

      if (!id_vendedor || !id_cliente) {
        return res.status(400).json({
          success: false,
          message: 'Vendedor y cliente son requeridos'
        });
      }

      const asignacionId = await asignacionRepository.asignar(id_vendedor, id_cliente);

      res.status(201).json({
        success: true,
        message: 'Cliente asignado exitosamente',
        data: { asignacionId }
      });
    } catch (error) {
      console.error('Error al asignar cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al asignar cliente'
      });
    }
  }

  // Reasignar cliente a otro vendedor
  async reasignar(req, res) {
    try {
      const { id_asignacion, nuevo_id_vendedor } = req.body;

      if (!id_asignacion || !nuevo_id_vendedor) {
        return res.status(400).json({
          success: false,
          message: 'ID de asignación y nuevo vendedor son requeridos'
        });
      }

      const nuevaAsignacionId = await asignacionRepository.reasignar(id_asignacion, nuevo_id_vendedor);

      res.json({
        success: true,
        message: 'Cliente reasignado exitosamente',
        data: { nuevaAsignacionId }
      });
    } catch (error) {
      console.error('Error al reasignar cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al reasignar cliente'
      });
    }
  }

  // Quitar asignación
  async quitar(req, res) {
    try {
      const { id } = req.params;

      await asignacionRepository.quitar(id);

      res.json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al quitar asignación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al quitar asignación',
        error: error.message
      });
    }
  }

}

export default new AsignacionController();