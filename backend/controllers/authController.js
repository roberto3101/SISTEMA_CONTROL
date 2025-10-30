import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

class AuthController {

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validación de campos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const user = await userRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no existe'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user.estado === 'bloqueado') {
        return res.status(403).json({
          success: false,
          message: 'Cuenta bloqueada. Contacte al administrador.'
        });
      }

      // Verificar si la cuenta está inactiva
      if (user.estado === 'inactivo') {
        return res.status(403).json({
          success: false,
          message: 'Cuenta inactiva. Contacte al administrador.'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Incrementar intentos fallidos
        const newAttempts = user.intentos_fallidos + 1;
        
        if (newAttempts >= 3) {
          await userRepository.blockAccount(user.id_usuario);
          return res.status(403).json({
            success: false,
            message: 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.'
          });
        }

        await userRepository.updateFailedAttempts(user.id_usuario, newAttempts);

        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
          intentosRestantes: 3 - newAttempts
        });
      }

      // Resetear intentos fallidos
      if (user.intentos_fallidos > 0) {
        await userRepository.updateFailedAttempts(user.id_usuario, 0);
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id_usuario, 
          email: user.email, 
          rol: user.rol 
        },
        process.env.JWT_SECRET || 'secret_key_temporal',
        { expiresIn: '8h' }
      );

      // Respuesta exitosa
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            id: user.id_usuario,
            nombre: user.nombre_completo,
            email: user.email,
            rol: user.rol
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  }

  // Listar todos los usuarios (solo admin)
  async getAllUsers(req, res) {
    try {
      const usuarios = await userRepository.findAll();
      
      res.json({
        success: true,
        data: { usuarios }
      });

    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar usuarios',
        error: error.message
      });
    }
  }

  // Register (solo para administradores)
  async register(req, res) {
    try {
      const { nombre_completo, email, password, rol } = req.body;

      // Validación de campos
      if (!nombre_completo || !email || !password || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Validar rol válido
      const rolesValidos = ['administrador', 'vendedor', 'auxiliar_administrativo'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({
          success: false,
          message: 'Rol no válido'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const userId = await userRepository.create({
        nombre_completo,
        email,
        password: hashedPassword,
        rol
      });

      // Obtener usuario creado
      const newUser = await userRepository.findById(userId);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: newUser
        }
      });

    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req, res) {
    try {
      const user = await userRepository.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  }

}

export default new AuthController();