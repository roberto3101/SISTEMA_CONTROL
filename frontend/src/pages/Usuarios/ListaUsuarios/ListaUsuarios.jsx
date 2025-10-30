import { useState, useEffect } from 'react';
import { authAPI } from '../../../api/api';
import styles from './ListaUsuarios.module.css';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers();
      
     if (response.data.success) {
  setUsuarios(response.data.data.usuarios); // ← CORRECTO
}
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getRolBadgeClass = (rol) => {
    switch(rol) {
      case 'administrador':
        return styles.badgeAdmin;
      case 'vendedor':
        return styles.badgeVendedor;
      case 'auxiliar_administrativo':
        return styles.badgeAuxiliar;
      default:
        return styles.badgeDefault;
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'activo':
        return styles.badgeActivo;
      case 'inactivo':
        return styles.badgeInactivo;
      case 'bloqueado':
        return styles.badgeBloqueado;
      default:
        return styles.badgeDefault;
    }
  };

  const formatRol = (rol) => {
    const roles = {
      'administrador': 'Administrador',
      'vendedor': 'Vendedor',
      'auxiliar_administrativo': 'Auxiliar Administrativo'
    };
    return roles[rol] || rol;
  };

  const formatEstado = (estado) => {
    const estados = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'bloqueado': 'Bloqueado'
    };
    return estados[estado] || estado;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar usuarios por término de búsqueda
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Lista de Usuarios</h1>
          <p>Gestiona todos los usuarios del sistema</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => window.location.href = '/usuarios/registrar'}
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Usuarios</span>
            <span className={styles.statValue}>{usuarios.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Activos</span>
            <span className={styles.statValue}>
              {usuarios.filter(u => u.estado === 'activo').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚗</div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Vendedores</span>
            <span className={styles.statValue}>
              {usuarios.filter(u => u.rol === 'vendedor').length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>
                    <div className={styles.userName}>
                      <div className={styles.userAvatar}>
                        {usuario.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      {usuario.nombre_completo}
                    </div>
                  </td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`${styles.badge} ${getRolBadgeClass(usuario.rol)}`}>
                      {formatRol(usuario.rol)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getEstadoBadgeClass(usuario.estado)}`}>
                      {formatEstado(usuario.estado)}
                    </span>
                  </td>
                  <td>{formatFecha(usuario.fecha_creacion)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaUsuarios;