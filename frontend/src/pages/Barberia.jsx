import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    api.getBarberia(id)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBarberia(data);
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

  const handleTurno = async () => {
    if (!nombre || !telefono) return;
    setLoading(true);
    
    const data = {
      id_barbero: barberoSeleccionado.id_barbero,
      id_servicio: servicioSeleccionado.id_servicio,
      nombre_cliente: nombre,
      telefono: telefono
    };
    
    const resultado = await api.crearTurnoCola(id, data);
    setLoading(false);
    localStorage.setItem('barberia_actual', id);
    navigate(`/turno/${resultado.turno.codigo_confirmacion}`);
  };

  if (loading) return <div className="page"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="page"><div className="error">{error}</div></div>;
  if (!barberia) return <div className="page"><div className="error">Barbería no encontrada</div></div>;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Volver</button>
      
      <div className="header">
        <h1>{barberia.nombre}</h1>
        <p>{barberia.direccion}</p>
      </div>

      {paso === 1 && (
        <div className="step">
          <h2>1. Escoge tu barbero</h2>
          <div className="card-grid">
            {barberos.length === 0 ? (
              <p className="no-hay">No hay barberos disponibles</p>
            ) : (
              barberos.map(b => (
                <div 
                  key={b.id_barbero}
                  className={`card ${barberoSeleccionado?.id_barbero === b.id_barbero ? 'selected' : ''}`}
                  onClick={() => setBarberoSeleccionado(b)}
                >
                  <div className="card-icon">👨‍💼</div>
                  <h3>{b.nombre}</h3>
                </div>
              ))
            )}
          </div>
          {barberos.length > 0 && (
            <button 
              className="btn-primary" 
              disabled={!barberoSeleccionado}
              onClick={handleSiguiente}
            >
              Siguiente
            </button>
          )}
        </div>
      )}

      {paso === 2 && (
        <div className="step">
          <h2>2. Escoge el servicio</h2>
          <div className="card-grid">
            {servicios.map(s => (
              <div 
                key={s.id_servicio}
                className={`card ${servicioSeleccionado?.id_servicio === s.id_servicio ? 'selected' : ''}`}
                onClick={() => setServicioSeleccionado(s)}
              >
                <h3>{s.nombre}</h3>
                <p className="precio">${s.precio.toLocaleString()}</p>
                <p className="duracion">⏱️ {s.duracion_minutos} min</p>
              </div>
            ))}
          </div>
          <button 
            className="btn-primary" 
            disabled={!servicioSeleccionado}
            onClick={handleSiguiente}
          >
            Siguiente
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="step">
          <h2>3. Tus datos</h2>
          <div className="form">
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <button 
              className="btn-primary" 
              disabled={!nombre || !telefono || loading}
              onClick={handleTurno}
            >
              {loading ? 'Agendando...' : 'Tomar turno'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Barberia;
