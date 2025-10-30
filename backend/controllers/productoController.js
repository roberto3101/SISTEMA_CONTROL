import productoRepository from '../repositories/productoRepository.js';

class ProductoController {

  // Listar todos los productos
  async getAll(req, res) {
    try {
      const productos = await productoRepository.findAll();
      
      res.json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar productos',
        error: error.message
      });
    }
  }

  // Obtener producto por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoRepository.findById(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: { producto }
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener producto',
        error: error.message
      });
    }
  }

  // Buscar productos
  async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido'
        });
      }

      const productos = await productoRepository.search(q);

      res.json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar productos',
        error: error.message
      });
    }
  }

  // Obtener productos con stock bajo
  async getStockBajo(req, res) {
    try {
      const productos = await productoRepository.getStockBajo();

      res.json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos con stock bajo',
        error: error.message
      });
    }
  }

  // Verificar disponibilidad de stock
  async verificarStock(req, res) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad inválida'
        });
      }

      const resultado = await productoRepository.verificarStock(id, cantidad);

      res.json({
        success: resultado.disponible,
        data: resultado
      });
    } catch (error) {
      console.error('Error al verificar stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar stock',
        error: error.message
      });
    }
  }

  // Crear producto (NUEVO)
  async create(req, res) {
    try {
      const productoData = req.body;

      // Validaciones
      if (!productoData.codigo || !productoData.nombre || !productoData.precio_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Código, nombre y precio son requeridos'
        });
      }

      // Verificar si el código ya existe
      const existente = await productoRepository.findByCodigo(productoData.codigo);
      if (existente) {
        return res.status(400).json({
          success: false,
          message: 'El código del producto ya existe'
        });
      }

      const productoId = await productoRepository.create(productoData);
      const nuevoProducto = await productoRepository.findById(productoId);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: { producto: nuevoProducto }
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear producto',
        error: error.message
      });
    }
  }

  // Actualizar producto (NUEVO)
  async update(req, res) {
    try {
      const { id } = req.params;
      const productoData = req.body;

      const productoExistente = await productoRepository.findById(id);
      if (!productoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      await productoRepository.update(id, productoData);
      const productoActualizado = await productoRepository.findById(id);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: { producto: productoActualizado }
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar producto',
        error: error.message
      });
    }
  }

  // Eliminar producto (NUEVO)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const producto = await productoRepository.findById(id);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      await productoRepository.delete(id);

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar producto',
        error: error.message
      });
    }
  }

}

export default new ProductoController();