import boletaRepository from '../repositories/boletaRepository.js';
import pedidoRepository from '../repositories/pedidoRepository.js';

class BoletaController {

  // Generar boleta desde un pedido
  async generateFromPedido(req, res) {
    try {
      const { id_pedido } = req.body;
      const idAuxiliar = req.user.id;

      // Validar que el pedido exista
      const pedido = await pedidoRepository.findById(id_pedido);
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      // Validar que el pedido esté confirmado o entregado
      if (pedido.estado === 'anulado') {
        return res.status(400).json({
          success: false,
          message: 'No se puede generar boleta de un pedido anulado'
        });
      }

      // Verificar si ya existe boleta para este pedido
      const boletaExistente = await boletaRepository.findByPedido(id_pedido);
      if (boletaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Este pedido ya tiene una boleta registrada',
          data: { boleta: boletaExistente }
        });
      }

      // Generar número de boleta
      const numeroBoleta = await boletaRepository.generateNumeroBoleta();

      // Crear boleta
      const boletaId = await boletaRepository.create({
        numero_boleta: numeroBoleta,
        id_pedido: pedido.id_pedido,
        id_vendedor: pedido.id_vendedor,
        id_cliente: pedido.id_cliente,
        subtotal: pedido.subtotal,
        igv: pedido.igv,
        total: pedido.total,
        id_auxiliar: idAuxiliar
      });

      const nuevaBoleta = await boletaRepository.findById(boletaId);

      res.status(201).json({
        success: true,
        message: 'Boleta generada exitosamente',
        data: { boleta: nuevaBoleta }
      });

    } catch (error) {
      console.error('Error al generar boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar boleta',
        error: error.message
      });
    }
  }

  // Listar todas las boletas
  async getAll(req, res) {
    try {
      const boletas = await boletaRepository.findAll();

      res.json({
        success: true,
        data: { boletas }
      });
    } catch (error) {
      console.error('Error al listar boletas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar boletas',
        error: error.message
      });
    }
  }

  // Obtener boleta por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const boleta = await boletaRepository.findById(id);

      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      res.json({
        success: true,
        data: { boleta }
      });
    } catch (error) {
      console.error('Error al obtener boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener boleta',
        error: error.message
      });
    }
  }

  // Emitir boleta (cambiar estado de registrada a emitida)
  async emitir(req, res) {
    try {
      const { id } = req.params;

      const boleta = await boletaRepository.findById(id);
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      if (boleta.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          message: 'No se puede emitir una boleta anulada'
        });
      }

      if (boleta.estado === 'emitida') {
        return res.status(400).json({
          success: false,
          message: 'La boleta ya está emitida'
        });
      }

      await boletaRepository.emitir(id);

      res.json({
        success: true,
        message: 'Boleta emitida exitosamente'
      });
    } catch (error) {
      console.error('Error al emitir boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al emitir boleta',
        error: error.message
      });
    }
  }

  // Anular boleta
  async anular(req, res) {
    try {
      const { id } = req.params;
      const { motivo_anulacion } = req.body;
      const idUsuario = req.user.id;

      if (!motivo_anulacion || motivo_anulacion.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un motivo de anulación'
        });
      }

      const boleta = await boletaRepository.findById(id);
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      if (boleta.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          message: 'La boleta ya está anulada'
        });
      }

      await boletaRepository.anular(id, motivo_anulacion, idUsuario);

      res.json({
        success: true,
        message: 'Boleta anulada exitosamente'
      });
    } catch (error) {
      console.error('Error al anular boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al anular boleta',
        error: error.message
      });
    }
  }

}

export default new BoletaController();