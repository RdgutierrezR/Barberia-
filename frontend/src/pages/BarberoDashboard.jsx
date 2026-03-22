import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Contabilidad from './Contabilidad';
import VistaAgenda from './VistaAgenda';
import Metricas from './Metricas';
import { Settings, Edit2, Smartphone, Check, SkipForward, X, Home, BarChart3, Calendar, DollarSign, LogOut, Plus, Clock } from 'lucide-react';

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
  const [mostrarModalTurno, setMostrarModalTurno] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [tipoReserva, setTipoReserva] = useState('hoy');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [formTurno, setFormTurno] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    id_servicio: '',
    fecha: '',
    hora: ''
  });
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

  const formatFechaCompleta = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  };

  const getFechasDisponibles = () => {
    const fechas = [];
    const hoy = new Date();
    for (let i = 0; i <= 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      fechas.push({
        valor: `${anio}-${mes}-${dia}`,
        label: formatFechaCompleta(`${anio}-${mes}-${dia}`)
      });
    }
    return fechas;
  };

  const getFechaHoy = () => {
    const hoy = new Date();
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]}`;
  };

  const turnoActual = colaDiaria.find(t => t.estado === 'en_proceso');
  const turnosEnEspera = colaDiaria.filter(t => t.estado !== 'en_proceso');

  const abrirModalTurno = async (tipo = 'hoy') => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${anio}-${mes}-${dia}`;
    
    const horaActual = hoy.getHours();
    const minutos = Math.ceil(hoy.getMinutes() / 30) * 30;
    const horaProxima = `${String(horaActual).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    
    setMostrarModalTurno(true);
    setTipoReserva(tipo);
    setLoadingServicios(true);
    setFormTurno({ 
      cliente_nombre: '', 
      cliente_telefono: '', 
      id_servicio: '', 
      fecha: tipo === 'hoy' ? fechaHoy : '', 
      hora: tipo === 'hoy' ? horaProxima : '' 
    });
    setHorariosDisponibles([]);
    
    try {
      const data = await api.getServicios(id_barberia);
      setServicios(data);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    }
    setLoadingServicios(false);
  };

  const cargarHorariosDisponibles = async () => {
    if (!formTurno.id_servicio || !formTurno.fecha) return;
    
    const servicio = servicios.find(s => s.id_servicio === parseInt(formTurno.id_servicio));
    if (!servicio) return;
    
    setLoadingHorarios(true);
    try {
      const data = await api.getDisponibilidad(id_barberia, id_barbero, formTurno.fecha, servicio.duracion_minutos);
      setHorariosDisponibles(data.horarios_disponibles || []);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setHorariosDisponibles([]);
    }
    setLoadingHorarios(false);
  };

  const cargarHorariosDisponibles默认 = async (fecha) => {
    setLoadingHorarios(true);
    try {
      const data = await api.getDisponibilidad(id_barberia, id_barbero, fecha, 30);
      setHorariosDisponibles(data.horarios_disponibles || []);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setHorariosDisponibles([]);
    }
    setLoadingHorarios(false);
  };

  const crearTurnoRapido = async (e) => {
    e.preventDefault();
    if (!formTurno.cliente_nombre.trim()) {
      alert('Ingresa el nombre del cliente');
      return;
    }
    if (!formTurno.id_servicio) {
      alert('Selecciona un servicio');
      return;
    }
    if (tipoReserva === 'cita' && (!formTurno.fecha || !formTurno.hora)) {
      alert('Selecciona fecha y hora para la cita');
      return;
    }
    try {
      if (tipoReserva === 'hoy') {
        await api.crearTurnoCola(id_barberia, {
          id_barbero: parseInt(id_barbero),
          nombre_cliente: formTurno.cliente_nombre.trim(),
          telefono: formTurno.cliente_telefono.trim() || 'Sin teléfono',
          id_servicio: parseInt(formTurno.id_servicio)
        });
        alert('Turno creado exitosamente');
      } else {
        await api.crearTurnoCita(id_barberia, {
          id_barbero: parseInt(id_barbero),
          nombre_cliente: formTurno.cliente_nombre.trim(),
          telefono: formTurno.cliente_telefono.trim() || 'Sin teléfono',
          id_servicio: parseInt(formTurno.id_servicio),
          cita_fecha_hora: `${formTurno.fecha} ${formTurno.hora}`
        });
        alert('Cita creada exitosamente');
      }
      setMostrarModalTurno(false);
      cargarCola();
    } catch (err) {
      alert('Error al crear turno: ' + err.message);
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
                <div className="user-avatar"><Settings size={24} /></div>
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
                <span className="horario-icon"><Clock size={16} /></span>
                <div className="horario-info">
                  <span className="horario-label">Mi horario hoy</span>
                  <span className="horario-horas">
                    {formatHora12h(horarioDia?.hora_inicio?.substring(0, 5) || horaInicio)} - {formatHora12h(horarioDia?.hora_fin?.substring(0, 5) || horaFin)}
                  </span>
                </div>
                <span className="horario-edit"><Edit2 size={14} /></span>
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
                      <Smartphone size={14} /> {turnoActual.cliente_telefono}
                    </div>
                  <div className="cliente-servicio">
                    {turnoActual.servicio_nombre} - {turnoActual.servicio_duracion} min
                  </div>
                  <div className="botones-accion">
                    <button className="btn-small btn-finalizar" onClick={siguiente}>
                      <Check size={14} /> Finalizar
                    </button>
                    <button className="btn-small btn-secondary" onClick={finalizarSolo}>
                      <SkipForward size={14} /> Solo fin
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
                      <div className="cola-telefono"><Smartphone size={12} /> {t.cliente_telefono}</div>
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
                      <X size={14} />
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
            <div className="user-avatar" onClick={() => abrirModalTurno('hoy')} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 'bold' }}>+</div>
          </div>
        </div>
      )}

      {renderVista()}

      {mostrarModalTurno && (
        <div className="modal-overlay" onClick={() => setMostrarModalTurno(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={18} /> Nuevo Turno</h3>
              <button className="modal-close" onClick={() => setMostrarModalTurno(false)}><X size={18} /></button>
            </div>
            
            <div className="tipo-reserva-modal">
              <button 
                className={`tipo-btn ${tipoReserva === 'hoy' ? 'active' : ''}`}
                onClick={() => { setTipoReserva('hoy'); setFormTurno({...formTurno, fecha: '', hora: ''}); setHorariosDisponibles([]); }}
              >
                <Calendar size={16} /> Para hoy
              </button>
              <button 
                className={`tipo-btn ${tipoReserva === 'cita' ? 'active' : ''}`}
                onClick={() => { setTipoReserva('cita'); setFormTurno({...formTurno, fecha: '', hora: ''}); setHorariosDisponibles([]); }}
              >
                <Calendar size={16} /> Agendar
              </button>
            </div>
            
            {tipoReserva === 'cita' && (
              <div className="modal-seccion">
                <div className="form-group">
                  <label>1. Selecciona el día</label>
                  <select
                    value={formTurno.fecha}
                    onChange={(e) => {
                      setFormTurno({ ...formTurno, fecha: e.target.value, hora: '' });
                      if (e.target.value) {
                        cargarHorariosDisponibles默认(e.target.value);
                      }
                    }}
                  >
                    <option value="">Seleccionar fecha</option>
                    {getFechasDisponibles().map(f => (
                      <option key={f.valor} value={f.valor}>{f.label}</option>
                    ))}
                  </select>
                </div>
                
                {formTurno.fecha && (
                  <div className="form-group">
                    <label>2. Elige un horario</label>
                    {loadingHorarios ? (
                      <p>Cargando...</p>
                    ) : horariosDisponibles.length === 0 ? (
                      <p className="text-muted">No hay horarios disponibles</p>
                    ) : (
                      <div className="horarios-grid">
                        {horariosDisponibles.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            className={`hora-btn ${formTurno.hora === hora ? 'active' : ''}`}
                            onClick={() => setFormTurno({ ...formTurno, hora })}
                          >
                            {formatHora12h(hora)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {(tipoReserva === 'hoy' || (tipoReserva === 'cita' && formTurno.fecha && formTurno.hora)) && (
              <form onSubmit={crearTurnoRapido} className="modal-form">
                <div className="form-group">
                  <label>Nombre del Cliente *</label>
                  <input
                    type="text"
                    value={formTurno.cliente_nombre}
                    onChange={(e) => setFormTurno({ ...formTurno, cliente_nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formTurno.cliente_telefono}
                    onChange={(e) => setFormTurno({ ...formTurno, cliente_telefono: e.target.value })}
                    placeholder="Ej: 3001234567"
                  />
                </div>
                <div className="form-group">
                  <label>Servicio *</label>
                  {loadingServicios ? (
                    <p>Cargando...</p>
                  ) : (
                    <select
                      value={formTurno.id_servicio}
                      onChange={(e) => setFormTurno({ ...formTurno, id_servicio: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar</option>
                      {servicios.map((s) => (
                        <option key={s.id_servicio} value={s.id_servicio}>
                          {s.nombre} - {s.duracion_minutos} min
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <button type="submit" className="btn-primary btn-full">
                  {tipoReserva === 'hoy' ? 'Crear Turno para Hoy' : 'Confirmar Cita'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="nav-barbero">
        <button className={`nav-item ${vistaActual === 'inicio' ? 'active' : ''}`} onClick={() => setVistaActual('inicio')}>
          <span className="nav-item-icon"><Home size={20} /></span>
          <span>Inicio</span>
        </button>
        <button className={`nav-item ${vistaActual === 'metricas' ? 'active' : ''}`} onClick={() => setVistaActual('metricas')}>
          <span className="nav-item-icon"><BarChart3 size={20} /></span>
          <span>Métricas</span>
        </button>
        <button className={`nav-item ${vistaActual === 'agenda' ? 'active' : ''}`} onClick={() => setVistaActual('agenda')}>
          <span className="nav-item-icon"><Calendar size={20} /></span>
          <span>Agenda</span>
        </button>
        <button className={`nav-item ${vistaActual === 'contabilidad' ? 'active' : ''}`} onClick={() => setVistaActual('contabilidad')}>
          <span className="nav-item-icon"><DollarSign size={20} /></span>
          <span>Contabilidad</span>
        </button>
        <button className={`nav-item ${vistaActual === 'ajustes' ? 'active' : ''}`} onClick={() => setVistaActual('ajustes')}>
          <span className="nav-item-icon"><Settings size={20} /></span>
          <span>Ajustes</span>
        </button>
        <button className="nav-item nav-item-logout" onClick={logout}>
          <span className="nav-item-icon"><LogOut size={20} /></span>
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}

export default BarberoDashboard;
