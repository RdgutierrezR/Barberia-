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
    if (!fechaStr) return '';
    const fechaHora = fechaStr.split(' ');
    if (fechaHora.length !== 2) return fechaStr;
    
    const [fecha, horaStr] = fechaHora;
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [hora, minuto] = horaStr.split(':').map(Number);
    
    const fechaObj = new Date(anio, mes - 1, dia, hora, minuto);
    let h = fechaObj.getHours();
    const min = fechaObj.getMinutes().toString().padStart(2, '0');
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
        {(() => {
          const [anio, mes, dia] = fechaSeleccionada.split('-').map(Number);
          const fecha = new Date(anio, mes - 1, dia);
          return `${diasSemana[fecha.getDay()]}, ${dia} de ${meses[fecha.getMonth()]}`;
        })()}
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
