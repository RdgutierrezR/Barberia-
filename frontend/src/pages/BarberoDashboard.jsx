import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Contabilidad from './Contabilidad';
import VistaAgenda from './VistaAgenda';

function BarberoDashboard() {
  const { id_barberia, id_barbero } = useParams();
  const navigate = useNavigate();
  const [colaDiaria, setColaDiaria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('inicio');
  const nombreBarbero = localStorage.getItem('barbero_nombre') || 'Barbero';

  useEffect(() => {
    if (!id_barberia || !id_barbero) return;
    
    const token = localStorage.getItem('barbero_token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarCola();
    const interval = setInterval(cargarCola, 5000);
    return () => clearInterval(interval);
  }, [id_barberia, id_barbero]);

  const cargarCola = async () => {
    try {
      const data = await api.getColaDiaria(id_barberia, id_barbero);
      if (Array.isArray(data)) {
        setColaDiaria(data);
        setError(null);
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
    try {
      await api.pasarSiguiente(id_barberia, id_barbero);
      cargarCola();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    navigate('/login', { replace: true });
  };

  const formatHora12h = (hora24) => {
    if (!hora24) return '';
    const [hora, minuto] = hora24.split(':');
    let h = parseInt(hora);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minuto} ${ampm}`;
  };

  const getFechaHoy = () => {
    const hoy = new Date();
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]}`;
  };

  const turnoActual = colaDiaria.find(t => t.estado === 'en_proceso');
  const turnosEnEspera = colaDiaria.filter(t => t.estado !== 'en_proceso');

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
          <VistaAgenda 
            id_barberia={id_barberia} 
            id_barbero={id_barbero}
            nombreBarbero={nombreBarbero}
          />
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
          <div className="dashboard-content">
            <div className="cola-hoy-header">
              <h2>AGENDA DE HOY</h2>
              <span className="fecha-hoy">{getFechaHoy()}</span>
            </div>

            <div className="actual-section">
              <h2>ATENDIENDO</h2>
              {turnoActual ? (
                <div className="cliente-actual">
                  <div className="cliente-actual-header">
                    <div className="cliente-nombre">{turnoActual.cliente_nombre}</div>
                    <span className={`tipo-badge ${turnoActual.tipo_reserva}`}>
                      {turnoActual.hora_programada ? formatHora12h(turnoActual.hora_programada) : '-'}
                    </span>
                  </div>
                  <div className="cliente-info-badge">
                    <span>📱</span> {turnoActual.cliente_telefono}
                  </div>
                  <div className="cliente-servicio">
                    {turnoActual.servicio_nombre} - {turnoActual.servicio_duracion} min
                  </div>
                  <div className="cliente-codigo">{turnoActual.codigo_confirmacion}</div>
                  <button className="btn-primary btn-finalizar" onClick={siguiente}>
                    Finalizar y siguiente
                  </button>
                </div>
              ) : (
                <div className="sin-cliente">
                  <p>No hay cliente en servicio</p>
                  {turnosEnEspera.length > 0 && (
                    <div className="botones-siguiente">
                      <button className="btn-primary" onClick={siguiente}>
                        Llamar siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="cola-section">
              <h2>AGENDA DE HOY</h2>
              <div className="cola-list">
                {turnosEnEspera.map((t, i) => (
                  <div key={t.id_turno} className={`cola-item ${t.tipo_reserva}`}>
                    <div className="cola-posicion">
                      <span className="posicion-num">{t.hora_programada ? formatHora12h(t.hora_programada) : '-'}</span>
                    </div>
                    <div className="cola-info">
                      <div className="cola-nombre-row">
                        <span className="cola-nombre">{t.cliente_nombre}</span>
                        <span className={`tipo-mini ${t.tipo_reserva}`}>
                          {t.servicio_duracion} min
                        </span>
                      </div>
                      <div className="cola-servicio">{t.servicio_nombre}</div>
                      <div className="cola-telefono">📱 {t.cliente_telefono}</div>
                    </div>
                    <div className="cola-hora">
                      <span className="hora-programada">#{t.posicion_en_cola}</span>
                    </div>
                  </div>
                ))}
                {turnosEnEspera.length === 0 && (
                  <p className="no-hay">No hay nadie en espera</p>
                )}
              </div>
            </div>
          </div>
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
