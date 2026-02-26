import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Contabilidad from './Contabilidad';

function BarberoDashboard() {
  const { id_barberia, id_barbero } = useParams();
  const navigate = useNavigate();
  const [cola, setCola] = useState([]);
  const [actual, setActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('inicio');
  const nombreBarbero = localStorage.getItem('barbero_nombre') || 'Barbero';

  useEffect(() => {
    if (!id_barberia || !id_barbero) return;
    
    const token = localStorage.getItem('barbero_token');
    console.log('Token:', token);
    if (!token) {
      navigate('/login');
      return;
    }
    cargarCola();
    const interval = setInterval(cargarCola, 3000);
    return () => clearInterval(interval);
  }, [id_barberia, id_barbero]);

  const cargarCola = async () => {
    try {
      const data = await api.getColaBarbero(id_barberia, id_barbero);
      console.log('Cola data:', data);
      if (Array.isArray(data)) {
        setCola(data);
        setError(null);
        const enProceso = data.find(t => t.estado === 'en_proceso');
        setActual(enProceso);
      } else {
        logout();
        return;
      }
      setLoading(false);
    } catch (err) {
      console.error('Error:', err.message);
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('JWT')) {
        logout();
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const siguiente = async () => {
    await api.pasarSiguiente(id_barberia, id_barbero);
    cargarCola();
  };

  const logout = () => {
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    navigate('/login', { replace: true });
  };

  const getEstadoLabel = (estado) => {
    switch(estado) {
      case 'en_proceso': return 'En servicio';
      case 'pendiente': return 'En espera';
      case 'confirmado': return 'Confirmado';
      default: return estado;
    }
  };

  const renderVista = () => {
    switch (vistaActual) {
      case 'contabilidad':
        return (
          <Contabilidad 
            idBarberia={id_barberia} 
            idBarbero={id_barbero}
            nombreBarbero={nombreBarbero}
          />
        );
      case 'agenda':
        return (
          <div className="agenda-page">
            <div className="header-barbero">
              <div className="header-barbero-top">
                <div className="header-barbero-info">
                  <h1>Agenda</h1>
                  <p>{nombreBarbero}</p>
                </div>
                <div className="user-avatar">📅</div>
              </div>
            </div>
            <div className="agenda-placeholder">
              <p>Próximamente: Vista completa de turnos</p>
            </div>
          </div>
        );
      case 'ajustes':
        return (
          <div className="ajustes-page">
            <div className="header-barbero">
              <div className="header-barbero-top">
                <div className="header-barbero-info">
                  <h1>Ajustes</h1>
                  <p>{nombreBarbero}</p>
                </div>
                <div className="user-avatar">⚙️</div>
              </div>
            </div>
            <div className="ajustes-placeholder">
              <p>Próximamente: Configuración de perfil</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="actual-section">
              <h2>Ahora</h2>
              {actual ? (
                <div className="cliente-actual">
                  <div className="cliente-nombre">{actual.cliente_nombre}</div>
                  <div className="cliente-info-badge">
                    <span>📱</span> {actual.cliente_telefono}
                  </div>
                  <div className="cliente-servicio">{actual.servicio_nombre}</div>
                  <div className="cliente-codigo">{actual.codigo_confirmacion}</div>
                  <button className="btn-primary" onClick={siguiente}>
                    Finalizar y siguiente
                  </button>
                </div>
              ) : (
                <div className="sin-cliente">
                  <p>No hay cliente en servicio</p>
                  {cola.length > 0 && (
                    <button className="btn-primary" onClick={siguiente}>
                      Llamar siguiente
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="cola-section">
              <h2>En espera</h2>
              <div className="cola-list">
                {cola.filter(t => t.estado !== 'en_proceso').map((t, i) => (
                  <div key={t.id_turno} className="cola-item">
                    <div className="cola-posicion">{i + 1}</div>
                    <div className="cola-info">
                      <div className="cola-nombre">{t.cliente_nombre}</div>
                      <div className="cola-servicio">{t.servicio_nombre}</div>
                      <div className="cola-telefono">📱 {t.cliente_telefono}</div>
                    </div>
                    <div className="cola-estado">{getEstadoLabel(t.estado)}</div>
                  </div>
                ))}
                {cola.filter(t => t.estado !== 'en_proceso').length === 0 && (
                  <p className="no-hay">No hay nadie en espera</p>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  if (loading && vistaActual === 'inicio') return <div className="page barbero-dashboard"><div className="loading">Cargando...</div></div>;
  if (error && vistaActual === 'inicio') return <div className="page barbero-dashboard"><div className="error">{error}</div></div>;

  return (
    <div className="page barbero-dashboard">
      {vistaActual === 'inicio' && (
        <div className="header-barbero">
          <div className="header-barbero-top">
            <div className="header-barbero-info">
              <h1>Hola, {nombreBarbero}</h1>
              <p>Barbería #{id_barberia}</p>
            </div>
            <div className="user-avatar">✂️</div>
          </div>
        </div>
      )}

      {renderVista()}

      <div className="nav-barbero">
        <button className={`nav-item ${vistaActual === 'inicio' ? 'active' : ''}`} onClick={() => setVistaActual('inicio')}>
          <span className="nav-item-icon">🏠</span>
          <span>Inicio</span>
        </button>
        <button className={`nav-item ${vistaActual === 'agenda' ? 'active' : ''}`} onClick={() => setVistaActual('agenda')}>
          <span className="nav-item-icon">📅</span>
          <span>Agenda</span>
        </button>
        <button className={`nav-item ${vistaActual === 'contabilidad' ? 'active' : ''}`} onClick={() => setVistaActual('contabilidad')}>
          <span className="nav-item-icon">💰</span>
          <span>Contabilidad</span>
        </button>
        <button className={`nav-item ${vistaActual === 'ajustes' ? 'active' : ''}`} onClick={() => setVistaActual('ajustes')}>
          <span className="nav-item-icon">⚙️</span>
          <span>Ajustes</span>
        </button>
        <button className="nav-item nav-item-logout" onClick={logout}>
          <span className="nav-item-icon">🚪</span>
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}

export default BarberoDashboard;
