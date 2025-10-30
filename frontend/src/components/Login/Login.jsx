import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.loginForm}>
          <h1>Sistema de Control de Pedidos</h1>
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.btnLogin}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <div className={styles.credentialsPanel}>
          <h3>👤 Usuarios de Prueba</h3>
          <p className={styles.info}>Haz clic para usar estas credenciales</p>

          <div 
            className={styles.credentialCard}
            onClick={() => fillCredentials('admin@sistema.com', 'admin123')}
          >
            <div className={styles.roleTag}>Administrador</div>
            <p><strong>Email:</strong> admin@sistema.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>

          <div 
            className={styles.credentialCard}
            onClick={() => fillCredentials('juan.perez@sistema.com', 'vendedor123')}
          >
            <div className={styles.roleTag}>Vendedor</div>
            <p><strong>Email:</strong> juan.perez@sistema.com</p>
            <p><strong>Password:</strong> vendedor123</p>
          </div>

          <div 
            className={styles.credentialCard}
            onClick={() => fillCredentials('carmen.torres@sistema.com', 'auxiliar123')}
          >
            <div className={styles.roleTag}>Auxiliar Administrativo</div>
            <p><strong>Email:</strong> carmen.torres@sistema.com</p>
            <p><strong>Password:</strong> auxiliar123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;