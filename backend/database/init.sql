-- ============================================
-- SCRIPT DE INICIALIZACIÓN BD: proyectoads2
-- Sistema de Control de Pedidos
-- ============================================

-- Eliminar la base de datos si existe y crearla nuevamente
DROP DATABASE IF EXISTS proyectoads2;
CREATE DATABASE proyectoads2;
USE proyectoads2;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'vendedor', 'auxiliar_administrativo') NOT NULL,
    estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
    intentos_fallidos INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_negocio VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    distrito VARCHAR(50),
    referencia TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    tiene_deuda BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre_negocio (nombre_negocio),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: asignacion_clientes
-- ============================================
CREATE TABLE asignacion_clientes (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    id_cliente INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    UNIQUE KEY unique_vendedor_cliente (id_vendedor, id_cliente),
    INDEX idx_vendedor (id_vendedor),
    INDEX idx_cliente (id_cliente)
);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 10,
    unidad_medida VARCHAR(20) DEFAULT 'UNIDAD',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: visitas
-- ============================================
CREATE TABLE visitas (
    id_visita INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    id_cliente INT NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_visita DATETIME,
    estado_visita ENUM('pendiente', 'atendido', 'cerrado', 'pendiente_pago') DEFAULT 'pendiente',
    observaciones TEXT,
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_vendedor (id_vendedor),
    INDEX idx_cliente (id_cliente),
    INDEX idx_estado (estado_visita),
    INDEX idx_fecha_programada (fecha_programada)
);

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    id_cliente INT NOT NULL,
    id_visita INT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('registrado', 'confirmado', 'entregado', 'anulado') DEFAULT 'registrado',
    observaciones TEXT,
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_visita) REFERENCES visitas(id_visita) ON DELETE SET NULL,
    INDEX idx_vendedor (id_vendedor),
    INDEX idx_cliente (id_cliente),
    INDEX idx_fecha_pedido (fecha_pedido),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: detalle_pedido
-- ============================================
CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto)
);

-- ============================================
-- TABLA: boletas
-- ============================================
CREATE TABLE boletas (
    id_boleta INT AUTO_INCREMENT PRIMARY KEY,
    numero_boleta VARCHAR(20) NOT NULL UNIQUE,
    id_pedido INT NOT NULL,
    id_vendedor INT NOT NULL,
    id_cliente INT NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('emitida', 'anulada', 'registrada') DEFAULT 'emitida',
    motivo_anulacion TEXT,
    fecha_anulacion DATETIME,
    id_auxiliar INT,
    fecha_registro DATETIME,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_auxiliar) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_numero_boleta (numero_boleta),
    INDEX idx_pedido (id_pedido),
    INDEX idx_vendedor (id_vendedor),
    INDEX idx_cliente (id_cliente),
    INDEX idx_estado (estado),
    INDEX idx_fecha_emision (fecha_emision)
);

-- ============================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================

-- Usuario Administrador (password: admin123)
INSERT INTO usuarios (nombre_completo, email, password, rol, estado) VALUES
('Administrador Sistema', 'admin@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrador', 'activo');

-- Usuarios Vendedores (password: vendedor123)
INSERT INTO usuarios (nombre_completo, email, password, rol, estado) VALUES
('Juan Pérez García', 'juan.perez@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendedor', 'activo'),
('María López Ruiz', 'maria.lopez@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendedor', 'activo');

-- Usuario Auxiliar Administrativo (password: auxiliar123)
INSERT INTO usuarios (nombre_completo, email, password, rol, estado) VALUES
('Carmen Torres Díaz', 'carmen.torres@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'auxiliar_administrativo', 'activo');

-- Clientes de ejemplo
INSERT INTO clientes (nombre_negocio, nombre_contacto, telefono, direccion, distrito, estado) VALUES
('Bodega El Ahorro', 'Carlos Mendoza', '987654321', 'Av. Los Pinos 123', 'San Juan de Lurigancho', 'activo'),
('Minimarket San José', 'Rosa Fernández', '965432187', 'Jr. Las Flores 456', 'San Juan de Miraflores', 'activo'),
('Bodega Don Pepe', 'José Ramírez', '954321876', 'Av. Colonial 789', 'Callao', 'activo'),
('Tienda La Económica', 'Ana Gutiérrez', '943218765', 'Jr. Unión 321', 'Cercado de Lima', 'activo'),
('Bodega Mi Barrio', 'Luis Castro', '932187654', 'Av. Perú 654', 'San Miguel', 'activo');

-- Productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio_unitario, stock_actual, stock_minimo) VALUES
('PROD001', 'Coca Cola 1.5L', 'Gaseosa Coca Cola 1.5 Litros', 5.50, 100, 20),
('PROD002', 'Inca Kola 1.5L', 'Gaseosa Inca Kola 1.5 Litros', 5.50, 80, 20),
('PROD003', 'Agua San Luis 625ml', 'Agua mineral sin gas', 1.50, 200, 50),
('PROD004', 'Galletas Soda Field', 'Galletas saladas Pack x 6', 3.00, 150, 30),
('PROD005', 'Leche Gloria 1L', 'Leche evaporada entera', 4.50, 120, 25),
('PROD006', 'Arroz Paisana 1Kg', 'Arroz superior', 4.00, 90, 20),
('PROD007', 'Aceite Primor 1L', 'Aceite vegetal', 8.50, 60, 15),
('PROD008', 'Azúcar Cartavio 1Kg', 'Azúcar blanca refinada', 3.50, 110, 25),
('PROD009', 'Papel Higiénico Suave', 'Pack x 4 rollos', 6.00, 85, 20),
('PROD010', 'Detergente Ariel 1Kg', 'Detergente en polvo', 12.00, 70, 15);

-- Asignación de clientes a vendedores
INSERT INTO asignacion_clientes (id_vendedor, id_cliente) VALUES
(2, 1),
(2, 2),
(2, 3),
(3, 4),
(3, 5);

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

CREATE VIEW vista_ventas_vendedor AS
SELECT 
    u.id_usuario,
    u.nombre_completo AS vendedor,
    COUNT(DISTINCT b.id_boleta) AS total_boletas,
    SUM(b.total) AS monto_total_vendido,
    DATE_FORMAT(b.fecha_emision, '%Y-%m') AS periodo
FROM usuarios u
INNER JOIN boletas b ON u.id_usuario = b.id_vendedor
WHERE b.estado != 'anulada'
GROUP BY u.id_usuario, u.nombre_completo, DATE_FORMAT(b.fecha_emision, '%Y-%m');

CREATE VIEW vista_productos_stock_bajo AS
SELECT 
    id_producto,
    codigo,
    nombre,
    stock_actual,
    stock_minimo,
    (stock_minimo - stock_actual) AS cantidad_requerida
FROM productos
WHERE stock_actual <= stock_minimo AND estado = 'activo';

CREATE VIEW vista_clientes_deuda AS
SELECT 
    c.id_cliente,
    c.nombre_negocio,
    c.nombre_contacto,
    c.telefono,
    u.nombre_completo AS vendedor_asignado
FROM clientes c
LEFT JOIN asignacion_clientes ac ON c.id_cliente = ac.id_cliente
LEFT JOIN usuarios u ON ac.id_vendedor = u.id_usuario
WHERE c.tiene_deuda = TRUE AND c.estado = 'activo';



-- ============================================
-- TABLAS PARA SISTEMA DE PERMISOS DINÁMICOS
-- ============================================

-- Tabla de permisos disponibles
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    modulo VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_modulo (modulo)
);

-- Tabla de relación rol-permiso (muchos a muchos)
CREATE TABLE rol_permisos (
    id_rol_permiso INT AUTO_INCREMENT PRIMARY KEY,
    rol ENUM('administrador', 'vendedor', 'auxiliar_administrativo') NOT NULL,
    id_permiso INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_permiso (rol, id_permiso),
    INDEX idx_rol (rol)
);

-- Insertar permisos base
INSERT INTO permisos (nombre_permiso, descripcion, modulo) VALUES
-- Dashboard
('ver_dashboard', 'Ver página principal', 'dashboard'),

-- Usuarios
('registrar_usuario', 'Registrar nuevos usuarios', 'usuarios'),
('ver_usuarios', 'Ver lista de usuarios', 'usuarios'),
('editar_usuario', 'Editar información de usuarios', 'usuarios'),
('eliminar_usuario', 'Eliminar usuarios', 'usuarios'),
('gestionar_permisos', 'Gestionar permisos de roles', 'usuarios'),

-- Clientes
('crear_cliente', 'Crear nuevos clientes', 'clientes'),
('editar_cliente', 'Editar información de clientes', 'clientes'),
('eliminar_cliente', 'Eliminar clientes', 'clientes'),
('ver_clientes', 'Ver todos los clientes', 'clientes'),
('ver_clientes_asignados', 'Ver solo clientes asignados', 'clientes'),
('asignar_clientes', 'Asignar clientes a vendedores', 'clientes'),

-- Productos
('ver_productos', 'Ver catálogo de productos', 'productos'),
('ver_stock', 'Ver stock de productos', 'productos'),
('crear_producto', 'Crear nuevos productos', 'productos'),
('editar_producto', 'Editar productos', 'productos'),

-- Pedidos
('registrar_pedido', 'Registrar nuevos pedidos', 'pedidos'),
('ver_mis_pedidos', 'Ver mis propios pedidos', 'pedidos'),
('ver_pedidos', 'Ver todos los pedidos', 'pedidos'),
('editar_pedido', 'Editar pedidos', 'pedidos'),
('anular_pedido', 'Anular pedidos', 'pedidos'),

-- Visitas
('registrar_visita', 'Registrar visitas a clientes', 'visitas'),
('ver_mis_visitas', 'Ver mis visitas', 'visitas'),
('ver_visitas', 'Ver todas las visitas', 'visitas'),

-- Boletas
('generar_boleta', 'Generar boletas de venta', 'boletas'),
('ver_boletas', 'Ver boletas registradas', 'boletas'),
('registrar_boleta', 'Registrar boletas en sistema', 'boletas'),
('modificar_boleta', 'Modificar boletas', 'boletas'),
('anular_boleta', 'Anular boletas', 'boletas'),

-- Reportes
('ver_reportes', 'Ver reportes del sistema', 'reportes'),
('exportar_reportes', 'Exportar reportes', 'reportes'),

-- Sistema
('ver_todos_vendedores', 'Ver todos los vendedores', 'sistema');

-- Asignar permisos al rol ADMINISTRADOR
INSERT INTO rol_permisos (rol, id_permiso) 
SELECT 'administrador', id_permiso FROM permisos;

-- Asignar permisos al rol VENDEDOR
INSERT INTO rol_permisos (rol, id_permiso)
SELECT 'vendedor', id_permiso FROM permisos 
WHERE nombre_permiso IN (
    'ver_dashboard',
    'ver_clientes_asignados',
    'registrar_pedido',
    'generar_boleta',
    'ver_mis_pedidos',
    'ver_productos',
    'ver_stock',
    'registrar_visita',
    'ver_mis_visitas'
);

-- Asignar permisos al rol AUXILIAR_ADMINISTRATIVO
INSERT INTO rol_permisos (rol, id_permiso)
SELECT 'auxiliar_administrativo', id_permiso FROM permisos 
WHERE nombre_permiso IN (
    'ver_dashboard',
    'ver_boletas',
    'registrar_boleta',
    'modificar_boleta',
    'anular_boleta',
    'ver_reportes'
);








-- ============================================
-- ACTUALIZACIÓN: TABLA VISITAS MEJORADA
-- ============================================

-- Desactivar verificación de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla visitas anterior
DROP TABLE IF EXISTS visitas;

-- Crear tabla visitas mejorada
CREATE TABLE visitas (
  id_visita INT PRIMARY KEY AUTO_INCREMENT,
  id_vendedor INT NOT NULL,
  id_cliente INT NOT NULL,
  fecha_visita DATETIME NOT NULL,
  tipo_visita ENUM('prospeccion', 'seguimiento', 'entrega', 'cobranza', 'otro') DEFAULT 'seguimiento',
  estado ENUM('programada', 'realizada', 'cancelada') DEFAULT 'programada',
  observaciones TEXT,
  resultado TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  INDEX idx_vendedor (id_vendedor),
  INDEX idx_cliente (id_cliente),
  INDEX idx_fecha (fecha_visita),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar datos de ejemplo de visitas
INSERT INTO visitas (id_vendedor, id_cliente, fecha_visita, tipo_visita, estado, observaciones, resultado) VALUES
(2, 1, '2025-01-15 10:00:00', 'seguimiento', 'realizada', 'Visita de seguimiento para verificar satisfacción', 'Cliente satisfecho, solicitó más información de nuevos productos'),
(2, 2, '2025-01-16 14:30:00', 'entrega', 'realizada', 'Entrega de pedido anterior', 'Entrega exitosa, cliente pagó en efectivo'),
(2, 1, '2025-01-20 09:00:00', 'cobranza', 'programada', 'Visita para cobro de factura pendiente', NULL),
(3, 4, '2025-01-18 11:00:00', 'prospeccion', 'realizada', 'Primera visita al cliente potencial', 'Interesado en nuestros productos, programar nueva visita'),
(2, 2, '2025-01-22 15:00:00', 'seguimiento', 'programada', 'Seguimiento post-venta', NULL),
(3, 5, '2025-01-19 16:00:00', 'entrega', 'realizada', 'Entrega de productos solicitados', 'Cliente satisfecho con la entrega'),
(2, 3, '2025-01-25 10:30:00', 'prospeccion', 'programada', 'Presentación de nuevos productos', NULL);

-- ============================================
-- VISTA: Reporte de visitas por vendedor
-- ============================================
DROP VIEW IF EXISTS vista_visitas_vendedor;
CREATE VIEW vista_visitas_vendedor AS
SELECT 
    v.id_visita,
    v.fecha_visita,
    v.tipo_visita,
    v.estado,
    v.observaciones,
    v.resultado,
    u.nombre_completo AS vendedor,
    c.nombre_negocio,
    c.nombre_contacto,
    c.telefono,
    c.direccion,
    DATE_FORMAT(v.fecha_visita, '%Y-%m') AS periodo
FROM visitas v
INNER JOIN usuarios u ON v.id_vendedor = u.id_usuario
INNER JOIN clientes c ON v.id_cliente = c.id_cliente
ORDER BY v.fecha_visita DESC;

-- ============================================
-- VISTA: Visitas pendientes
-- ============================================
DROP VIEW IF EXISTS vista_visitas_pendientes;
CREATE VIEW vista_visitas_pendientes AS
SELECT 
    v.id_visita,
    v.fecha_visita,
    v.tipo_visita,
    v.observaciones,
    u.nombre_completo AS vendedor,
    c.nombre_negocio,
    c.nombre_contacto,
    c.telefono,
    c.distrito
FROM visitas v
INNER JOIN usuarios u ON v.id_vendedor = u.id_usuario
INNER JOIN clientes c ON v.id_cliente = c.id_cliente
WHERE v.estado = 'programada' AND v.fecha_visita >= CURDATE()
ORDER BY v.fecha_visita ASC;