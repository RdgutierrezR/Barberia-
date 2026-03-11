import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Contabilidad from './Contabilidad';
import VistaAgenda from './VistaAgenda';
import Metricas from './Metricas';

function BarberoDashboard() {
  const { id_barberia, id_barbero } = useParams();
  const navigate = useNavigate();
  const [colaDiaria, setColaDiaria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('inicio');
  const [horarioDia, setHorarioDia] = useState(null);
  const [mostrarSelectorHorario, setMostrarSelectorHorario] = useState(false);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const nombreBarbero = localStorage.getItem('barbero_nombre') || 'Barbero';

  useEffect(() => {
    if (!id_barberia || !id_barbero) return;
    
    const token = localStorage.getItem('barbero_token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarCola();
    cargarHorarioDia();
    const interval = setInterval(cargarCola, 5000);
    return () => clearInterval(interval);
  }, [id_barberia, id_barbero]);

  const cargarHorarioDia = async () => {
    try {
      const data = await api.getHorarioDia(id_barberia, id_barbero);
      setHorarioDia(data);
      if (data.hora_inicio) {
        setHoraInicio(data.hora_inicio.substring(0, 5));
      }
      if (data.hora_fin) {
        setHoraFin(data.hora_fin.substring(0, 5));
      }
    } catch (err) {
      console.error('Error al cargar horario:', err);
    }
  };

  const guardarHorarioDia = async () => {
    try {
      if (!horaInicio || !horaFin) {
        alert('Por favor selecciona hora de inicio y fin');
        return;
      }
      
      const fechaHoy = new Date();
      const año = fechaHoy.getFullYear();
      const mes = String(fechaHoy.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaHoy.getDate()).padStart(2, '0');
      const fechaISO = `${año}-${mes}-${dia}`;
      
      console.log('Guardando horario:', {
        id_barberia: id_barberia,
        id_barbero: parseInt(id_barbero),
        fecha: fechaISO,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      
      const result = await api.setHorarioDia(id_barberia, {
        id_barbero: parseInt(id_barbero),
        fecha: fechaISO,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      
      console.log('Horario guardado:', result);
      alert('Horario actualizado correctamente');
      setMostrarSelectorHorario(false);
      cargarHorarioDia();
      cargarCola();
    } catch (err) {
      console.error('Error al guardar horario:', err);
      alert('Error al guardar horario: ' + err.message);
    }
  };

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

  const finalizarSolo = async () => {
    if (!turnoActual) return;
    if (!confirm('¿Finalizar este turno sin llamar al siguiente?')) return;
    try {
      await api.finalizarSolo(id_barberia, id_barbero);
      cargarCola();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const cancelarTurno = async (idTurno) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return;
    try {
      await api.cancelarTurno(id_barberia, idTurno);
      cargarCola();
    } catch (err) {
      console.error('Error al cancelar:', err);
      alert('Error al cancelar turno');
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
      case 'metricas':
        return (
          <Metricas 
            id_barberia={id_barberia} 
            id_barbero={id_barbero}
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

            <div className="horario-dia-selector">
              <div className="horario-actual" onClick={() => setMostrarSelectorHorario(!mostrarSelectorHorario)}>
                <span className="horario-icon">🕐</span>
                <div className="horario-info">
                  <span className="horario-label">Mi horario hoy:</span>
                  <span className="horario-horas">
                    {horarioDia?.hora_inicio?.substring(0, 5) || horaInicio} - {horarioDia?.hora_fin?.substring(0, 5) || horaFin}
                  </span>
                </div>
                <span className="horario-edit">✏️</span>
              </div>
              
              {mostrarSelectorHorario && (
                <div className="selector-horario-panel">
                  <div className="selector-row">
                    <label>Inicio:</label>
                    <input 
                      type="time" 
                      value={horaInicio} 
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="selector-row">
                    <label>Fin:</label>
                    <input 
                      type="time" 
                      value={horaFin} 
                      onChange={(e) => setHoraFin(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" onClick={guardarHorarioDia}>
                    Guardar Horario
                  </button>
                </div>
              )}
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
                  <div className="botones-accion">
                    <button className="btn-small btn-finalizar" onClick={siguiente}>
                      ✓ Finalizar
                    </button>
                    <button className="btn-small btn-secondary" onClick={finalizarSolo}>
                      ⏭ Solo fin
                    </button>
                  </div>
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
                      <span className="posicion-num">#{t.posicion_en_cola}</span>
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
                      {t.hora_programada && (
                        <span className="hora-programada">{formatHora12h(t.hora_programada)}</span>
                      )}
                      <span className="tipo-reserva-label">{t.tipo_reserva === 'cola' ? 'En cola' : 'Cita'}</span>
                    </div>
                    <button 
                      className="btn-cancelar-turno" 
                      onClick={() => cancelarTurno(t.id_turno)}
                      title="Cancelar turno"
                    >
                      ✕
                    </button>
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
        <button className={`nav-item ${vistaActual === 'metricas' ? 'active' : ''}`} onClick={() => setVistaActual('metricas')}>
          <span className="nav-item-icon">📊</span>
          <span>Métricas</span>
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
