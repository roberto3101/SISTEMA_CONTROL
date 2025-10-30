import { useState } from 'react';
import { authAPI } from '../../../api/api';
import styles from './RegistrarUsuario.module.css';

const RegistrarUsuario = () => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'vendedor'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authAPI.register(dataToSend);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Usuario registrado exitosamente' });
        // Limpiar formulario
        setFormData({
          nombre_completo: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'vendedor'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al registrar usuario' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Registrar Nuevo Usuario</h1>
        <p>Complete el formulario para crear un nuevo usuario en el sistema</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label htmlFor="nombre_completo">
              Nombre Completo <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="nombre_completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@sistema.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rol">
              Rol <span className={styles.required}>*</span>
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
            >
              <option value="vendedor">Vendedor</option>
              <option value="auxiliar_administrativo">Auxiliar Administrativo</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              Contraseña <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              Confirmar Contraseña <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Repite la contraseña"
            />
          </div>

        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.btnSecondary}
            onClick={() => {
              setFormData({
                nombre_completo: '',
                email: '',
                password: '',
                confirmPassword: '',
                rol: 'vendedor'
              });
              setMessage({ type: '', text: '' });
            }}
          >
            Limpiar
          </button>
          <button 
            type="submit" 
            className={styles.btnPrimary}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarUsuario;