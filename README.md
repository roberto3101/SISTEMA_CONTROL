# Sistema de Gestión de Visitas y Ventas

Sistema web para la gestión integral de clientes, vendedores, visitas, pedidos y boletas de venta.

## 🚀 Características

- **Gestión de Usuarios**: Roles (Administrador, Vendedor, Auxiliar Administrativo)
- **Gestión de Clientes**: Registro, búsqueda y asignación a vendedores
- **Visitas**: Programación, seguimiento y registro de resultados
- **Pedidos**: Creación y gestión de pedidos con validación de stock
- **Boletas**: Generación y modificación de boletas de venta
- **Productos**: Control de inventario y stock
- **Asignación de Clientes**: Distribución de cartera por vendedor

## 🛠️ Tecnologías

### Frontend
- React 18
- React Router DOM
- CSS Modules
- Axios

### Backend
- Node.js
- Express
- MySQL
- JWT (autenticación)
- bcrypt (encriptación)

## 📋 Requisitos Previos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd proyecto
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_ventas
JWT_SECRET=tu_secret_key
```

Crear la base de datos:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

Configurar API en `src/api/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

## 🚀 Ejecución

### Backend
```bash
cd backend
npm start
# Servidor en http://localhost:5000
```

### Frontend
```bash
cd frontend
npm start
# Aplicación en http://localhost:3000
```

## 👥 Roles y Permisos

### Administrador
- Acceso total al sistema
- Gestión de usuarios
- Asignación de clientes
- Gestión de productos
- Generación de reportes

### Vendedor
- Ver sus visitas asignadas
- Registrar visitas y pedidos
- Generar boletas
- Consultar productos

### Auxiliar Administrativo
- Modificar boletas
- Registrar pedidos
- Ver boletas



## 🔐 Seguridad

- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Validación de permisos por rol
- Protección de rutas en frontend y backend

## 📊 Casos de Uso Principales

1. **CU-05**: Registrar Visita
2. **CU-13**: Gestionar Mis Visitas
3. **CU-03**: Asignar Clientes a Vendedores
4. **CU-06**: Registrar Pedido
5. **CU-08**: Generar Boleta

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.



## 📧 Contacto

Para consultas: [tu-email@ejemplo.com]
