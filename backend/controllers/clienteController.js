import clienteRepository from '../repositories/clienteRepository.js';

class ClienteController {

  // Listar todos los clientes
  async getAll(req, res) {
    try {
      const clientes = await clienteRepository.findAll();
      
      res.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      console.error('Error al listar clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar clientes',
        error: error.message
      });
    }
  }

  // Obtener cliente por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const cliente = await clienteRepository.findById(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: { cliente }
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cliente',
        error: error.message
      });
    }
  }

  // Buscar clientes
  async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido'
        });
      }

      const clientes = await clienteRepository.search(q);

      res.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar clientes',
        error: error.message
      });
    }
  }

  // Crear nuevo cliente
  async create(req, res) {
    try {
      const clienteData = req.body;

      // Validaciones
      if (!clienteData.nombre_negocio || !clienteData.nombre_contacto) {
        return res.status(400).json({
          success: false,
          message: 'Nombre del negocio y nombre de contacto son requeridos'
        });
      }

      const clienteId = await clienteRepository.create(clienteData);
      const nuevoCliente = await clienteRepository.findById(clienteId);

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: { cliente: nuevoCliente }
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear cliente',
        error: error.message
      });
    }
  }

  // Actualizar cliente
  async update(req, res) {
    try {
      const { id } = req.params;
      const clienteData = req.body;

      const clienteExistente = await clienteRepository.findById(id);
      if (!clienteExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      await clienteRepository.update(id, clienteData);
      const clienteActualizado = await clienteRepository.findById(id);

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: { cliente: clienteActualizado }
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar cliente',
        error: error.message
      });
    }
  }

  // Eliminar cliente
  async delete(req, res) {
    try {
      const { id } = req.params;

      const cliente = await clienteRepository.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      await clienteRepository.delete(id);

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar cliente',
        error: error.message
      });
    }
  }

  // Obtener clientes del vendedor autenticado
  async getMisClientes(req, res) {
    try {
      const vendedorId = req.user.id;
      const clientes = await clienteRepository.findByVendedor(vendedorId);

      res.json({
        success: true,
        data: { clientes }
      });
    } catch (error) {
      console.error('Error al obtener clientes del vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: error.message
      });
    }
  }

}

export default new ClienteController();