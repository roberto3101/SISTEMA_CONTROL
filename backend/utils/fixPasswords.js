import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function fixPasswords() {
  try {
    console.log('🔧 Actualizando contraseñas...');

    // Hash de 'admin123'
    const hashAdmin = await bcrypt.hash('admin123', 10);
    await pool.query(
      'UPDATE usuarios SET password = ?, estado = "activo", intentos_fallidos = 0 WHERE email = ?',
      [hashAdmin, 'admin@sistema.com']
    );
    console.log('✅ Admin actualizado');

    // Hash de 'vendedor123'
    const hashVendedor = await bcrypt.hash('vendedor123', 10);
    await pool.query(
      'UPDATE usuarios SET password = ?, estado = "activo", intentos_fallidos = 0 WHERE email IN (?, ?)',
      [hashVendedor, 'juan.perez@sistema.com', 'maria.lopez@sistema.com']
    );
    console.log('✅ Vendedores actualizados');

    // Hash de 'auxiliar123'
    const hashAuxiliar = await bcrypt.hash('auxiliar123', 10);
    await pool.query(
      'UPDATE usuarios SET password = ?, estado = "activo", intentos_fallidos = 0 WHERE email = ?',
      [hashAuxiliar, 'carmen.torres@sistema.com']
    );
    console.log('✅ Auxiliar actualizado');

    console.log('✅ Todas las contraseñas actualizadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();