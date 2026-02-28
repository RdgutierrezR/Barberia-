import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminPanel() {
  const navigate = useNavigate();
  const [codigoActual, setCodigoActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('barbero_token');
    const rol = localStorage.getItem('barbero_rol');
    if (!token || rol !== 'admin') {
      navigate('/login');
    }
  }, []);

  const generarCodigo = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.generarInvitacion('crear_barberia');
      setCodigoActual(result.invitacion.codigo);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    localStorage.removeItem('barbero_rol');
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin BarberApp</h1>
        <button className="admin-logout" onClick={logout}>Salir</button>
      </div>

      <div className="admin-section">
        <h2>Generar Codigo para Nueva Barberia</h2>
        <div className="codigo-display">
          <label>Codigo de invitacion</label>
          {codigoActual ? (
            <div className="codigo">{codigoActual}</div>
          ) : (
            <div className="codigo-vacio">Sin codigo generado</div>
          )}
        </div>
        <button 
          className="btn-generar" 
          onClick={generarCodigo}
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Generar Nuevo Codigo'}
        </button>
        {error && <div className="error-message" style={{marginTop: '12px'}}>{error}</div>}
      </div>

      <div className="admin-section">
        <h2>Informacion</h2>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
          Genera un codigo de invitacion y compartelo con tus clientes para que puedan crear su barberia.
          Cada codigo solo puede ser usado una vez.
        </p>
      </div>
    </div>
  );
}

export default AdminPanel;
