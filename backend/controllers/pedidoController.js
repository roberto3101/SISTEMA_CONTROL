import pedidoRepository from '../repositories/pedidoRepository.js';

class PedidoController {

  // Crear pedido
  async create(req, res) {
    try {
      const pedidoData = req.body;
      const vendedorId = req.user.id; // Del token JWT

      // Validaciones
      if (!pedidoData.id_cliente || !pedidoData.productos || pedidoData.productos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cliente y productos son requeridos'
        });
      }

      // Agregar id_vendedor del usuario autenticado
      pedidoData.id_vendedor = vendedorId;

      const pedidoId = await pedidoRepository.create(pedidoData);
      const nuevoPedido = await pedidoRepository.findById(pedidoId);

      res.status(201).json({
        success: true,
        message: 'Pedido registrado exitosamente',
        data: { pedido: nuevoPedido }
      });

    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear pedido',
        error: error.message
      });
    }
  }

  // Listar todos los pedidos
  async getAll(req, res) {
    try {
      const pedidos = await pedidoRepository.findAll();

      res.json({
        success: true,
        data: { pedidos }
      });
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar pedidos',
        error: error.message
      });
    }
  }

  // Obtener pedido por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoRepository.findById(id);

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      res.json({
        success: true,
        data: { pedido }
      });
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pedido',
        error: error.message
      });
    }
  }

  // Obtener pedidos del vendedor autenticado
  async getMisPedidos(req, res) {
    try {
      const vendedorId = req.user.id;
      const pedidos = await pedidoRepository.findByVendedor(vendedorId);

      res.json({
        success: true,
        data: { pedidos }
      });
    } catch (error) {
      console.error('Error al obtener pedidos del vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pedidos',
        error: error.message
      });
    }
  }

  // Actualizar estado del pedido
  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['registrado', 'confirmado', 'entregado', 'anulado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      await pedidoRepository.updateEstado(id, estado);

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

}

export default new PedidoController();