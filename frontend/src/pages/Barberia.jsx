import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function Barberia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barberia, setBarberia] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [paso, setPaso] = useState(1);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
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
        setBarberos(data);
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

  const handleSiguiente = () => {
    if (paso === 1 && barberoSeleccionado) {
      setPaso(2);
    } else if (paso === 2 && servicioSeleccionado) {
      setPaso(3);
    }
  };

  const handleVolver = () => {
    if (paso === 2) {
      setBarberoSeleccionado(null);
      setPaso(1);
    } else if (paso === 3) {
      setServicioSeleccionado(null);
      setPaso(2);
    }
  };

  const handleTurno = async () => {
    if (!nombre || !telefono) return;
    setLoading(true);
    
    const data = {
      id_barbero: barberoSeleccionado.id_barbero,
      id_servicio: servicioSeleccionado.id_servicio,
      nombre_cliente: nombre,
      telefono: telefono
    };
    
    try {
      const resultado = await api.crearTurnoCola(id, data);
      navigate(`/turno/${resultado.turno.codigo_confirmacion}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
                className={`servicio-card ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'selected' : ''}`}
                onClick={() => setServicioSeleccionado(s)}
              >
                <div className="servicio-info">
                  <h3>{s.nombre}</h3>
                  <span className="servicio-duracion">⏱️ {s.duracion_minutos} min</span>
                </div>
                <div className="servicio-precio">
                  ${s.precio.toLocaleString()}
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
        <div className="step paso-datos">
          <div className="step-header">
            <button className="btn-volver" onClick={handleVolver}>←</button>
            <span className="step-numero">3</span>
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
      )}
    </div>
  );
}

export default Barberia;
