// Permisos basados en los 11 CU del diagrama
export const PERMISSIONS = {
  administrador: [
    'iniciar_sesion',
    'registrar_usuario',
    'mantener_cliente',
    'buscar_cliente',
    'registrar_visita',
    'buscar_vendedor',
    'registrar_pedido',
    'buscar_pedido',
    'buscar_producto',
    'mantener_productos',
    'registrar_boleta', 
    'ver_reportes',
    'modificar_boleta',
    'ver_boletas',
    'ver_mis_visitas'  // 🆕 Agregado para el admin
  ],

  vendedor: [
    'iniciar_sesion',
    'buscar_vista_asignada',
    'registrar_boleta',
    // 'registrar_visita',  // ❌ REMOVIDO - El vendedor ya NO puede registrar visitas
    'ver_mis_visitas',      // ✅ AGREGADO - Solo puede ver sus visitas
    'buscar_pedido',
    'registrar_pedido',
    'buscar_producto',
    'buscar_cliente',
    'ver_boletas'
  ],

  auxiliar_administrativo: [
    'iniciar_sesion',
    'modificar_boleta',
    'buscar_pedido',
    'ver_reportes',
    'registrar_boleta',
    'ver_boletas'
  ]
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.includes(permission) || false;
};

export const MENU_ITEMS = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: '🏠',
    permission: 'iniciar_sesion'
  },
  {
    title: 'Usuarios',
    icon: '👥',
    permission: 'registrar_usuario',
    subItems: [
      {
        title: 'Registrar Usuario',
        path: '/usuarios/registrar',
        permission: 'registrar_usuario'
      },
      {
        title: 'Lista Usuarios',
        path: '/usuarios/lista',
        permission: 'registrar_usuario'
      }
    ]
  },
  {
    title: 'Clientes',
    icon: '🏢',
    permission: 'mantener_cliente',
    subItems: [
      {
        title: 'Lista Clientes',
        path: '/clientes/lista',
        permission: 'mantener_cliente'
      },
      {
        title: 'Buscar Cliente',
        path: '/clientes/buscar',
        permission: 'buscar_cliente'
      },
      {
        title: 'Asignar Clientes',
        path: '/clientes/asignar',
        permission: 'mantener_cliente'
      }
    ]
  },

  {
    title: 'Boletas',
    icon: '🧾',
    permission: 'ver_boletas',
    subItems: [
      {
        title: 'Generar Boleta',
        path: '/boletas/generar',
        permission: 'registrar_boleta'
      },
      {
        title: 'Lista Boletas',
        path: '/boletas/lista',
        permission: 'ver_boletas'
      }
    ]
  },

  {
    title: 'Vendedores',
    icon: '🚗',
    permission: 'buscar_vendedor',
    path: '/vendedores/gestionar'
  },
  {
    title: 'Visitas',
    icon: '📅',
    permission: 'registrar_visita',  // El menú principal requiere permiso de admin
    subItems: [
      {
        title: 'Registrar Visita',
        path: '/visitas/registrar',
        permission: 'registrar_visita'  // ✅ Solo admin
      },
      {
        title: 'Mis Visitas',
        path: '/visitas/mis-visitas',
        permission: 'ver_mis_visitas'  // ✅ Cambiado - Ahora usa el nuevo permiso
      }
    ]
  },
  {
    title: 'Pedidos',
    icon: '📦',
    permission: 'registrar_pedido',
    subItems: [
      {
        title: 'Registrar Pedido',
        path: '/pedidos/registrar',
        permission: 'registrar_pedido'
      },
      {
        title: 'Lista Pedidos',
        path: '/pedidos/lista',
        permission: 'buscar_pedido'
      }
    ]
  },
  {
    title: 'Productos',
    icon: '📦',
    permission: 'buscar_producto',
    subItems: [
      {
        title: 'Consultar Stock',
        path: '/productos/stock',
        permission: 'buscar_producto'
      },
      {
        title: 'Gestionar Productos',
        path: '/productos/gestionar',
        permission: 'mantener_productos'
      }
    ]
  },
  {
    title: 'Reportes',
    icon: '📊',
    permission: 'ver_reportes',
    path: '/reportes'
  }
];

export const getMenuByRole = (userRole) => {
  return MENU_ITEMS.filter(item => {
    if (!hasPermission(userRole, item.permission)) {
      return false;
    }

    if (item.subItems) {
      item.subItems = item.subItems.filter(subItem =>
        hasPermission(userRole, subItem.permission)
      );
      return item.subItems.length > 0;
    }

    return true;
  });
};