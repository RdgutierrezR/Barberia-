import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getFechaLocal, formatFechaMostrar } from '../utils/fecha';

function Barberia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barberia, setBarberia] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [paso, setPaso] = useState(1);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [tipoReserva, setTipoReserva] = useState('hoy');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const serviciosRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    api.getBarberia(id)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBarberia(data);
        localStorage.setItem('barberia_actual', id);
        return api.getBarberos(id);
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBarberos(data.filter(b => b.rol !== 'owner' && b.rol !== 'admin'));
        return api.getServicios(id);
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setServicios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando datos:", err);
        setError(err.message || "Error al cargar los datos");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (tipoReserva === 'cita' && barberoSeleccionado && servicioSeleccionado && fechaSeleccionada) {
      cargarHorariosDisponibles();
    }
  }, [tipoReserva, fechaSeleccionada, barberoSeleccionado, servicioSeleccionado]);

  const cargarHorariosDisponibles = async () => {
    console.log('Cargando horarios:', {
      idBarberia: id,
      idBarbero: barberoSeleccionado?.id_barbero,
      fecha: fechaSeleccionada,
      duracion: servicioSeleccionado?.duracion_minutos
    });
    setLoadingHorarios(true);
    try {
      const data = await api.getDisponibilidad(
        id, 
        barberoSeleccionado.id_barbero, 
        fechaSeleccionada, 
        servicioSeleccionado.duracion_minutos
      );
      console.log('Horarios recibidos:', data);
      setHorariosDisponibles(data.horarios_disponibles || []);
    } catch (err) {
      console.error('Error cargando horarios:', err);
      setHorariosDisponibles([]);
    }
    setLoadingHorarios(false);
  };

  const handleSiguiente = () => {
    if (paso === 1 && barberoSeleccionado) {
      setPaso(2);
    } else if (paso === 2 && servicioSeleccionado) {
      setPaso(3);
    }
  };

  const handleVolver = () => {
    if (paso === 5) {
      setPaso(4);
    } else if (paso === 4) {
      if (tipoReserva === 'cita') {
        setFechaSeleccionada('');
        setHoraSeleccionada('');
      }
      setTipoReserva('hoy');
      setPaso(3);
    } else if (paso === 3) {
      setServicioSeleccionado(null);
      setPaso(2);
    } else if (paso === 2) {
      setBarberoSeleccionado(null);
      setPaso(1);
    }
  };

  const handleTipoReserva = (tipo) => {
    setTipoReserva(tipo);
    if (tipo === 'cita') {
      setFechaSeleccionada(getFechaLocal());
    }
    setPaso(4);
  };

  const handleTurno = async () => {
    if (!nombre || !telefono) return;
    setLoading(true);
    
    try {
      if (tipoReserva === 'hoy') {
        const data = {
          id_barbero: barberoSeleccionado.id_barbero,
          id_servicio: servicioSeleccionado.id_servicio,
          nombre_cliente: nombre,
          telefono: telefono
        };
        const resultado = await api.crearTurnoCola(id, data);
        navigate(`/turno/${resultado.turno.codigo_confirmacion}`);
      } else {
        const data = {
          id_barbero: barberoSeleccionado.id_barbero,
          id_servicio: servicioSeleccionado.id_servicio,
          cita_fecha_hora: `${fechaSeleccionada} ${horaSeleccionada}`,
          nombre_cliente: nombre,
          telefono: telefono
        };
        const resultado = await api.crearTurnoCita(id, data);
        navigate(`/turno/${resultado.turno.codigo_confirmacion}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const generarFechas = () => {
    const fechas = [];
    const hoy = new Date();
    for (let i = 0; i <= 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const opcionesDia = i === 0 
        ? { weekday: 'long', day: 'numeric', month: 'long' }
        : { weekday: 'long', day: 'numeric', month: 'short' };
      const label = i === 0 
        ? 'Hoy - ' + fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
        : fecha.toLocaleDateString('es-CO', opcionesDia);
      fechas.push({
        valor: `${anio}-${mes}-${dia}`,
        label: label.charAt(0).toUpperCase() + label.slice(1)
      });
    }
    return fechas;
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

  const scrollToServicios = () => {
    serviciosRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !barberia) return <div className="page"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="page"><div className="error">{error}</div></div>;
  if (!barberia) return <div className="page"><div className="error">Barbería no encontrada</div></div>;

  return (
    <div className="page barberia-page">
      <div className="barberia-header">
        <div className="barberia-logo">
          {barberia.logo_url ? (
            <img src={barberia.logo_url} alt={barberia.nombre} />
          ) : (
            <span>✂️</span>
          )}
        </div>
        <h1>{barberia.nombre}</h1>
        {barberia.direccion && <p className="barberia-direccion">📍 {barberia.direccion}</p>}
        {barberia.telefono && <p className="barberia-telefono">📞 {barberia.telefono}</p>}
      </div>

      {paso === 1 && (
        <div className="step paso-barberos">
          <div className="step-header">
            <span className="step-numero">1</span>
            <h2>¿Quién te va a atender?</h2>
          </div>
          
          <div className="barberos-grid">
            {barberos.length === 0 ? (
              <p className="no-hay">No hay barberos disponibles</p>
            ) : (
              barberos.map(b => (
                <div 
                  key={b.id_barbero}
                  className={`barbero-card ${barberoSeleccionado?.id_barbero === b.id_barbero ? 'selected' : ''}`}
                  onClick={() => setBarberoSeleccionado(b)}
                >
                  <div className="barbero-foto">
                    {b.foto_url ? (
                      <img src={b.foto_url} alt={b.nombre} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <h3>{b.nombre}</h3>
                </div>
              ))
            )}
          </div>
          
          {barberos.length > 0 && (
            <button 
              className="btn-primary btn-siguiente" 
              disabled={!barberoSeleccionado}
              onClick={handleSiguiente}
            >
              Continuar
            </button>
          )}
        </div>
      )}

      {paso === 2 && (
        <div className="step paso-servicios">
          <div className="step-header">
            <button className="btn-volver" onClick={handleVolver}>←</button>
            <span className="step-numero">2</span>
            <h2>¿Qué servicio quieres?</h2>
          </div>
          
          <div className="servicios-list">
            {servicios.map(s => (
              <div 
                key={s.id_servicio}
                className={`servicio-card-eleccion ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'selected' : ''}`}
                onClick={() => setServicioSeleccionado(s)}
              >
                <div className="servicio-info-eleccion">
                  <h3>{s.nombre}</h3>
                  <span className="servicio-duracion-eleccion">⏱️ {s.duracion_minutos} min</span>
                </div>
                  <div className="servicio-derecha-eleccion">
                  <div className="servicio-precio-eleccion">
                    ${s.precio?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="btn-primary btn-siguiente" 
            disabled={!servicioSeleccionado}
            onClick={handleSiguiente}
          >
            Continuar
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="step paso-fecha">
          <div className="step-header">
            <button className="btn-volver" onClick={handleVolver}>←</button>
            <span className="step-numero">3</span>
            <h2>¿Para cuándo quieres el turno?</h2>
          </div>

          <div className="tipo-reserva">
            <div 
              className={`tipo-card ${tipoReserva === 'hoy' ? 'selected' : ''}`}
              onClick={() => handleTipoReserva('hoy')}
            >
              <span className="tipo-icon">📅</span>
              <h3>Para hoy</h3>
              <p>Te agrego a la cola</p>
            </div>
            <div 
              className={`tipo-card ${tipoReserva === 'cita' ? 'selected' : ''}`}
              onClick={() => handleTipoReserva('cita')}
            >
              <span className="tipo-icon">⏰</span>
              <h3>Agendar</h3>
              <p>Elige fecha y hora</p>
            </div>
          </div>
        </div>
      )}

      {paso === 4 && tipoReserva === 'cita' && (
        <div className="step paso-horario">
          <div className="step-header">
            <button className="btn-volver" onClick={handleVolver}>←</button>
            <span className="step-numero">4</span>
            <h2>Elige fecha y hora</h2>
          </div>

          <div className="selector-fecha-cliente">
            <label>Selecciona fecha:</label>
            <select 
              value={fechaSeleccionada} 
              onChange={(e) => { setFechaSeleccionada(e.target.value); setHoraSeleccionada(''); }}
            >
              <option value="">Selecciona una fecha</option>
              {generarFechas().map(f => (
                <option key={f.valor} value={f.valor}>{f.label}</option>
              ))}
            </select>
          </div>

          {fechaSeleccionada && (
            <div className="selector-hora">
              <label>Horarios disponibles:</label>
              {loadingHorarios ? (
                <p className="loading-small">Cargando...</p>
              ) : horariosDisponibles.length === 0 ? (
                <p className="no-hay">No hay horarios disponibles</p>
              ) : (
                <div className="horarios-grid">
                  {horariosDisponibles.map(h => (
                    <button
                      key={h}
                      className={`hora-btn ${horaSeleccionada === h ? 'selected' : ''}`}
                      onClick={() => setHoraSeleccionada(h)}
                    >
                      {formatHora12h(h)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {horaSeleccionada && (
            <button 
              className="btn-primary btn-siguiente" 
              onClick={() => setPaso(5)}
            >
              Continuar
            </button>
          )}
        </div>
      )}

      {(paso === 4 && tipoReserva === 'hoy') || paso === 5 ? (
        <div className="step paso-datos">
          <div className="step-header">
            <button className="btn-volver" onClick={handleVolver}>←</button>
            <span className="step-numero">{paso === 5 ? '5' : '4'}</span>
            <h2>Tus datos</h2>
          </div>
          
          <div className="resumen-turno">
            <div className="resumen-item">
              <span>Barbero</span>
              <strong>{barberoSeleccionado?.nombre}</strong>
            </div>
            <div className="resumen-item">
              <span>Servicio</span>
              <strong>{servicioSeleccionado?.nombre}</strong>
            </div>
            {tipoReserva === 'cita' && (
              <div className="resumen-item">
                <span>Fecha y hora</span>
                <strong>{formatFechaMostrar(fechaSeleccionada)} a las {formatHora12h(horaSeleccionada)}</strong>
              </div>
            )}
            <div className="resumen-item">
              <span>Precio</span>
              <strong>${servicioSeleccionado?.precio?.toLocaleString()}</strong>
            </div>
          </div>
          
          <div className="form">
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <button 
              className="btn-primary" 
              disabled={!nombre || !telefono || loading}
              onClick={handleTurno}
            >
              {loading ? 'Agendando...' : 'Confirmar Turno'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Barberia;
