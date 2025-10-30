import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { clienteAPI, visitaAPI } from '../../../api/api';
import styles from './RegistrarVisita.module.css';

const RegistrarVisita = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchCliente, setSearchCliente] = useState('');

  const [formData, setFormData] = useState({
    id_cliente: '',
    fecha_visita: '',
    tipo_visita: 'seguimiento',
    estado: 'programada',
    observaciones: ''
  });

useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteAPI.getAll();
      
      if (response.data.success) {
        setClientes(response.data.data.clientes);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.id_cliente) {
        setError('Debe seleccionar un cliente');
        setLoading(false);
        return;
      }

      if (!formData.fecha_visita) {
        setError('Debe ingresar una fecha y hora');
        setLoading(false);
        return;
      }

      const response = await visitaAPI.create(formData);

      if (response.data.success) {
        setSuccess('Visita registrada exitosamente');
        
        // Resetear formulario
        setFormData({
          id_cliente: '',
          fecha_visita: '',
          tipo_visita: 'seguimiento',
          estado: 'programada',
          observaciones: ''
        });

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar visita');
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre_negocio.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.nombre_contacto.toLowerCase().includes(searchCliente.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Registrar Visita</h1>
          <p>Programa o registra una visita realizada a un cliente</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Seleccionar Cliente */}
          <div className={styles.formGroup}>
            <label>Cliente *</label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              className={styles.searchInput}
            />
            
        {searchCliente.length > 0 && (
              <div className={styles.clientesDropdown}>
                {clientesFiltrados.slice(0, 5).map(cliente => (
                  <div
                    key={cliente.id_cliente}
                    className={styles.clienteOption}
                    onClick={() => {
                      setFormData({ ...formData, id_cliente: cliente.id_cliente });
                      setSearchCliente(`${cliente.nombre_negocio} - ${cliente.nombre_contacto}`);
                    }}
                  >
                    <strong>{cliente.nombre_negocio}</strong>
                    <span>{cliente.nombre_contacto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className={styles.formGroup}>
            <label>Fecha y Hora de Visita *</label>
            <input
              type="datetime-local"
              name="fecha_visita"
              value={formData.fecha_visita}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo de Visita */}
          <div className={styles.formGroup}>
            <label>Tipo de Visita *</label>
            <select
              name="tipo_visita"
              value={formData.tipo_visita}
              onChange={handleChange}
              required
            >
              <option value="prospeccion">Prospección</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="entrega">Entrega</option>
              <option value="cobranza">Cobranza</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Estado */}
          <div className={styles.formGroup}>
            <label>Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="programada">Programada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Detalles de la visita, motivo, etc."
              rows={4}
            />
          </div>

          {/* Botones */}
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.btnSecondary}
              onClick={() => {
                setFormData({
                  id_cliente: '',
                  fecha_visita: '',
                  tipo_visita: 'seguimiento',
                  estado: 'programada',
                  observaciones: ''
                });
                setSearchCliente('');
              }}
            >
              Limpiar
            </button>
            <button 
              type="submit" 
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Visita'}
            </button>
          </div>
        </form>

        {/* Info adicional */}
        <div className={styles.infoBox}>
          <h3>💡 Tipos de Visita:</h3>
          <ul>
            <li><strong>Prospección:</strong> Primera visita a cliente potencial</li>
            <li><strong>Seguimiento:</strong> Visita de control y atención</li>
            <li><strong>Entrega:</strong> Entrega de productos/pedidos</li>
            <li><strong>Cobranza:</strong> Cobro de facturas pendientes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegistrarVisita;