import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Home() {
  const navigate = useNavigate();
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBarberias().then(data => {
      setBarberias(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="page home-page">
      <div className="hero">
        <div className="hero-icon">✂️</div>
        <h1>BarberApp</h1>
        <p>Escanea el código QR de tu barbería para comenzar</p>
      </div>

      <div className="barberia-list">
        <h2 className="section-title">Tus barberías</h2>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : barberias.length === 0 ? (
          <div className="empty-state">
            <p>No hay barberías disponibles</p>
          </div>
        ) : (
          barberias.map(b => (
            <div 
              key={b.id_barberia} 
              className="barberia-card"
              onClick={() => navigate(`/barberia/${b.id_barberia}`)}
            >
              <div className="barberia-icon">✂️</div>
              <div className="barberia-info">
                <h3>{b.nombre}</h3>
                <p>{b.direccion || 'Ver ubicación'}</p>
              </div>
              <div className="barberia-arrow">→</div>
            </div>
          ))
        )}
      </div>

      <button className="btn-barbero-login" onClick={() => navigate('/login')}>
        Acceder como Barbero
      </button>
    </div>
  );
}

export default Home;
