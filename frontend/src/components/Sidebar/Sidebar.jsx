import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuByRole } from '../../config/permissions';
import styles from './Sidebar.module.css';
import { useState } from 'react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = user ? getMenuByRole(user.rol) : [];

  const toggleSubmenu = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Sistema Control</h2>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.nombre}</p>
          <span className={styles.userRole}>{user?.rol}</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item, index) => (
          <div key={index} className={styles.menuItem}>
            {item.subItems ? (
              <>
                <div 
                  className={styles.menuLink}
                  onClick={() => toggleSubmenu(index)}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span>{item.title}</span>
                  <span className={`${styles.arrow} ${expandedItems[index] ? styles.expanded : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedItems[index] && (
                  <div className={styles.submenu}>
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className={`${styles.submenuLink} ${
                          isActiveRoute(subItem.path) ? styles.active : ''
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`${styles.menuLink} ${
                  isActiveRoute(item.path) ? styles.active : ''
                }`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;