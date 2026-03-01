import { useState, useEffect } from 'react';
import { api } from '../api';

function VistaAgenda({ id_barberia, id_barbero, nombreBarbero }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [turnosCitas, setTurnosCitas] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
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
        const fechaInicio = new Date(b.fecha_inicio).toISOString().split('T')[0];
        const fechaFin = new Date(b.fecha_fin).toISOString().split('T')[0];
        return fechaInicio <= fechaSeleccionada && fechaFin >= fechaSeleccionada;
      }));
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
    setLoading(false);
  };

  const handleCrearBloqueo = async () => {
    if (!nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin) {
      alert('Por favor selecciona fecha y hora de inicio y fin');
      return;
    }
    try {
      await api.crearBloqueo(id_barberia, {
        id_barbero: parseInt(id_barbero),
        fecha_inicio: nuevoBloqueo.fecha_inicio,
        fecha_fin: nuevoBloqueo.fecha_fin,
        motivo: nuevoBloqueo.motivo || 'Bloqueo de agenda'
      });
      setMostrarModalBloqueo(false);
      setNuevoBloqueo({ fecha_inicio: '', fecha_fin: '', motivo: '' });
      cargarDatos();
      alert('Bloqueo creado exitosamente');
    } catch (err) {
      alert(err.message);
    }
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
    const fecha = new Date(fechaStr);
    let hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${hora}:${minuto} ${ampm}`;
  };

  const getNombreDia = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return diasSemana[fecha.getDay()];
  };

  const cambiarFecha = (dias) => {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + dias);
    const hoy = new Date();
    const maxFecha = new Date();
    maxFecha.setDate(hoy.getDate() + 15);
    
    if (fecha < hoy) return;
    if (fecha > maxFecha) return;
    
    setFechaSeleccionada(fecha.toISOString().split('T')[0]);
  };

  const generarDias = () => {
    const dias = [];
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
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
            <h1>Agenda</h1>
            <p>{nombreBarbero}</p>
          </div>
          <button className="btn-primary" onClick={() => setMostrarModalBloqueo(true)}>
            + Bloquear
          </button>
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
        {diasSemana[new Date(fechaSeleccionada).getDay()]}, {new Date(fechaSeleccionada).getDate()} de {meses[new Date(fechaSeleccionada).getMonth()]}
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <div className="turnos-citas">
            <h3>Citas Programadas</h3>
            {turnosCitas.length === 0 ? (
              <p className="no-hay">No hay citas para este día</p>
            ) : (
              turnosCitas.map((turno) => (
                <div key={turno.id_turno} className="cita-card">
                  <div className="cita-hora">{formatFecha(turno.cita_fecha_hora)}</div>
                  <div className="cita-info">
                    <div className="cita-cliente">{turno.cliente_nombre}</div>
                    <div className="cita-servicio">{turno.servicio_nombre}</div>
                    <div className="cita-telefono">📱 {turno.cliente_telefono}</div>
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
                    <span className="cita-completado">✓ Completado</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bloqueos-dia">
            <h3>Bloqueos</h3>
            {bloqueos.length === 0 ? (
              <p className="no-hay">No hay bloqueos para este día</p>
            ) : (
              bloqueos.map((bloqueo) => (
                <div key={bloqueo.id_bloqueo} className="bloqueo-card">
                  <div className="bloqueo-hora">
                    {formatFecha(bloqueo.fecha_inicio)} - {formatFecha(bloqueo.fecha_fin)}
                  </div>
                  <div className="bloqueo-info">
                    <div className="bloqueo-motivo">{bloqueo.motivo || 'Bloqueo'}</div>
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
        </>
      )}

      {mostrarModalBloqueo && (
        <div className="modal-overlay" onClick={() => setMostrarModalBloqueo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Bloqueo</h2>
            <div className="form-group">
              <label>Fecha y hora de inicio</label>
              <input
                type="datetime-local"
                value={nuevoBloqueo.fecha_inicio}
                onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha_inicio: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Fecha y hora de fin</label>
              <input
                type="datetime-local"
                value={nuevoBloqueo.fecha_fin}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNuevoBloqueo({...nuevoBloqueo, fecha_fin: e.target.value})}
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
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setMostrarModalBloqueo(false)}>
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
