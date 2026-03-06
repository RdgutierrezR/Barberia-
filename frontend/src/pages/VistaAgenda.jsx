import { useState, useEffect } from 'react';
import { api } from '../api';
import { getFechaLocal, parsearFecha, formatearFechaHora } from '../utils/fecha';

function VistaAgenda({ id_barberia, id_barbero, nombreBarbero }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    return getFechaLocal();
  });
  const [turnosCitas, setTurnosCitas] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
  const [errorBloqueo, setErrorBloqueo] = useState('');
  const [nuevoBloqueo, setNuevoBloqueo] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  });

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  useEffect(() => {
    cargarDatos();
  }, [fechaSeleccionada]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [turnosData, bloqueosData] = await Promise.all([
        api.getTurnosCita(id_barberia, id_barbero, fechaSeleccionada),
        api.getBloqueos(id_barberia, id_barbero)
      ]);
      setTurnosCitas(turnosData);
      setBloqueos(bloqueosData.filter(b => {
        const f = new Date(b.fecha_inicio);
        const anio = f.getFullYear();
        const mes = String(f.getMonth() + 1).padStart(2, '0');
        const dia = String(f.getDate()).padStart(2, '0');
        const fechaInicio = `${anio}-${mes}-${dia}`;
        
        const f2 = new Date(b.fecha_fin);
        const anio2 = f2.getFullYear();
        const mes2 = String(f2.getMonth() + 1).padStart(2, '0');
        const dia2 = String(f2.getDate()).padStart(2, '0');
        const fechaFin = `${anio2}-${mes2}-${dia2}`;
        
        return fechaInicio <= fechaSeleccionada && fechaFin >= fechaSeleccionada;
      }));
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
    setLoading(false);
  };

  const handleCrearBloqueo = async () => {
    setErrorBloqueo('');
    if (!nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin) {
      setErrorBloqueo('Por favor selecciona fecha y hora de inicio y fin');
      return;
    }
    
    const inicio = new Date(nuevoBloqueo.fecha_inicio);
    const fin = new Date(nuevoBloqueo.fecha_fin);
    
    if (fin <= inicio) {
      setErrorBloqueo('La hora de fin debe ser mayor a la hora de inicio');
      return;
    }
    
    try {
      console.log('Creando bloqueo:', { id_barberia, data: {
        id_barbero: parseInt(id_barbero),
        fecha_inicio: nuevoBloqueo.fecha_inicio,
        fecha_fin: nuevoBloqueo.fecha_fin,
        motivo: nuevoBloqueo.motivo || 'Bloqueo de agenda'
      }});
      await api.crearBloqueo(id_barberia, {
        id_barbero: parseInt(id_barbero),
        fecha_inicio: nuevoBloqueo.fecha_inicio,
        fecha_fin: nuevoBloqueo.fecha_fin,
        motivo: nuevoBloqueo.motivo || 'Bloqueo de agenda'
      });
      setMostrarModalBloqueo(false);
      setNuevoBloqueo({ fecha_inicio: '', fecha_fin: '', motivo: '' });
      setErrorBloqueo('');
      cargarDatos();
      alert('Bloqueo creado exitosamente');
    } catch (err) {
      console.error('Error creando bloqueo:', err);
      setErrorBloqueo(err.message);
    }
  };

  const agregarBloqueoRapido = (horas, motivo) => {
    const ahora = new Date();
    const inicio = new Date(fechaSeleccionada + 'T' + '09:00');
    
    const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    fecha.setHours(12, 0, 0, 0);
    
    const fin = new Date(fecha.getTime() + horas * 60 * 60 * 1000);
    
    const formatDateTimeLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}`;
    };
    
    setNuevoBloqueo({
      fecha_inicio: formatDateTimeLocal(fecha),
      fecha_fin: formatDateTimeLocal(fin),
      motivo: motivo
    });
    setMostrarModalBloqueo(true);
    setErrorBloqueo('');
  };

  const handleEliminarBloqueo = async (idBloqueo) => {
    if (!confirm('¿Estás seguro de eliminar este bloqueo?')) return;
    try {
      await api.eliminarBloqueo(id_barberia, idBloqueo);
      cargarDatos();
      alert('Bloqueo eliminado');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    let fecha;
    if (fechaStr.includes('T')) {
      const [fechaPart, horaPart] = fechaStr.split('T');
      const [anio, mes, dia] = fechaPart.split('-').map(Number);
      const horaLimpia = horaPart.split('.')[0];
      const [hora, minuto] = horaLimpia.split(':').map(Number);
      fecha = new Date(anio, mes - 1, dia, hora, minuto);
    } else {
      const fechaHora = fechaStr.split(' ');
      if (fechaHora.length !== 2) return fechaStr;
      const [fechaStr2, horaStr] = fechaHora;
      const [anio, mes, dia] = fechaStr2.split('-').map(Number);
      const [hora, minuto] = horaStr.split(':').map(Number);
      fecha = new Date(anio, mes - 1, dia, hora, minuto);
    }
    let h = fecha.getHours();
    const min = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${min} ${ampm}`;
  };

  const getNombreDia = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = fechaStr.split(' ')[0];
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    return diasSemana[fechaObj.getDay()];
  };

  const cambiarFecha = (dias) => {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + dias);
    const hoy = new Date();
    const maxFecha = new Date();
    maxFecha.setDate(hoy.getDate() + 15);
    
    if (fecha < hoy) return;
    if (fecha > maxFecha) return;
    
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    setFechaSeleccionada(`${anio}-${mes}-${dia}`);
  };

  const generarDias = () => {
    const dias = [];
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      dias.push({
        fecha: `${anio}-${mes}-${dia}`,
        nombre: diasSemana[fecha.getDay()].substring(0, 3),
        numero: fecha.getDate(),
        esHoy: i === 0
      });
    }
    return dias;
  };

  const dias = generarDias();

  return (
    <div className="agenda-page">
      <div className="header-barbero">
        <div className="header-barbero-top">
          <div className="header-barbero-info">
            <h1>Mi Agenda</h1>
            <p>{nombreBarbero}</p>
          </div>
          <div className="header-actions">
            <button className="btn-bloquear" onClick={() => setMostrarModalBloqueo(true)}>
              + Bloquear
            </button>
          </div>
        </div>
      </div>

      <div className="selector-fecha">
        <button className="btn-nav-fecha" onClick={() => cambiarFecha(-1)}>◀</button>
        <div className="dias-scroll">
          {dias.map((dia) => (
            <button
              key={dia.fecha}
              className={`dia-btn ${fechaSeleccionada === dia.fecha ? 'active' : ''} ${dia.esHoy ? 'hoy' : ''}`}
              onClick={() => setFechaSeleccionada(dia.fecha)}
            >
              <span className="dia-nombre">{dia.nombre}</span>
              <span className="dia-numero">{dia.numero}</span>
            </button>
          ))}
        </div>
        <button className="btn-nav-fecha" onClick={() => cambiarFecha(1)}>▶</button>
      </div>

      <div className="fecha-actual">
        {(() => {
          const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number);
          const fecha = new Date(anio, mes - 1, dia);
          return <span>{diasSemana[fecha.getDay()]}, {dia} de {meses[fecha.getMonth()]}</span>;
        })()}
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="agenda-secciones">
          <div className="seccion-card seccion-citas">
            <div className="seccion-header">
              <h3>Citas Programadas</h3>
              <span className="seccion-count">{turnosCitas.length}</span>
            </div>
            
            {turnosCitas.length === 0 ? (
              <p className="no-hay">No hay citas programadas para este día</p>
            ) : (
              turnosCitas.map((turno) => (
                <div key={turno.id_turno} className="cita-card">
                  <div className="cita-hora">{formatFecha(turno.cita_fecha_hora)}</div>
                  <div className="cita-info">
                    <div className="cita-cliente">
                      {turno.cliente_nombre}
                    </div>
                    <div className="cita-servicio">{turno.servicio_nombre}</div>
                    <div className="cita-telefono">{turno.cliente_telefono}</div>
                  </div>
                  {turno.estado !== 'completado' ? (
                    <button 
                      className="btn-agregar-cola"
                      onClick={async () => {
                        if (confirm('¿Agregar esta cita a la cola?')) {
                          try {
                            await api.agregarCitaACola(id_barberia, turno.id_turno);
                            alert('Cita agregada a la cola');
                            cargarDatos();
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                    >
                      + Cola
                    </button>
                  ) : (
                    <span className="cita-completado">✓</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="seccion-card seccion-bloqueos">
            <div className="seccion-header">
              <h3>Bloqueos / Rescesos</h3>
              <span className="seccion-count">{bloqueos.length}</span>
            </div>
            
            {bloqueos.length === 0 ? (
              <p className="no-hay">No hay bloqueos programados para este día</p>
            ) : (
              bloqueos.map((bloqueo) => (
                <div key={bloqueo.id_bloqueo} className="bloqueo-card">
                  <div className="bloqueo-info">
                    <div className="bloqueo-motivo">{bloqueo.motivo || 'Bloqueo de agenda'}</div>
                    <div className="bloqueo-rango">
                      {formatFecha(bloqueo.fecha_inicio)} a {formatFecha(bloqueo.fecha_fin)}
                    </div>
                  </div>
                  <button 
                    className="btn-eliminar-bloqueo"
                    onClick={() => handleEliminarBloqueo(bloqueo.id_bloqueo)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {mostrarModalBloqueo && (
        <div className="modal-overlay" onClick={() => { setMostrarModalBloqueo(false); setErrorBloqueo(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Bloqueo</h2>
            
            <div className="bloqueo-rapido">
              <p className="bloqueo-rapido-label">Bloqueo rápido:</p>
              <div className="bloqueo-rapido-botones">
                <button 
                  className="btn-bloqueo-rapido"
                  onClick={() => agregarBloqueoRapido(1, 'Hora de receso')}
                >
                  1 hora
                </button>
                <button 
                  className="btn-bloqueo-rapido"
                  onClick={() => agregarBloqueoRapido(2, 'Hora de receso')}
                >
                  2 horas
                </button>
                <button 
                  className="btn-bloqueo-rapido"
                  onClick={() => agregarBloqueoRapido(9, 'Día completo')}
                >
                  Día completo
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Fecha y hora de inicio</label>
              <input
                type="datetime-local"
                value={nuevoBloqueo.fecha_inicio}
                onChange={(e) => { setNuevoBloqueo({...nuevoBloqueo, fecha_inicio: e.target.value}); setErrorBloqueo(''); }}
              />
            </div>
            <div className="form-group">
              <label>Fecha y hora de fin</label>
              <input
                type="datetime-local"
                value={nuevoBloqueo.fecha_fin}
                onChange={(e) => { setNuevoBloqueo({...nuevoBloqueo, fecha_fin: e.target.value}); setErrorBloqueo(''); }}
              />
            </div>
            <div className="form-group">
              <label>Motivo (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Descanso, Reunión, etc."
                value={nuevoBloqueo.motivo}
                onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, motivo: e.target.value})}
              />
            </div>
            
            {errorBloqueo && (
              <div className="error-message">{errorBloqueo}</div>
            )}
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setMostrarModalBloqueo(false); setErrorBloqueo(''); }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCrearBloqueo}>
                Crear Bloqueo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaAgenda;
