import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContent}>
        <div className={styles.navbarTitle}>
          <h1>Sistema de Control de Pedidos</h1>
        </div>

        <div className={styles.navbarRight}>
          <div className={styles.userSection}>
            <span className={styles.greeting}>Hola, {user?.nombre}</span>
            <button className={styles.btnLogout} onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;