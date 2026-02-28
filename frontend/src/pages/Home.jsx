import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verificarYRedirigir = async () => {
      const token = localStorage.getItem('barbero_token');
      const barberiaId = localStorage.getItem('barberia_id');
      const scanCode = searchParams.get('scan');
      
      // Primero verificar si es un código QR escaneado
      if (scanCode) {
        setRedirecting(true);
        try {
          const barberia = await api.getBarberiaPorCodigo(scanCode);
          navigate(`/barberia/${barberia.id_barberia}`, { replace: true });
          return;
        } catch (err) {
          console.error('Error al buscar barbería:', err);
          setRedirecting(false);
        }
      }
      
      // Si hay token, verificar si es válido antes de redirigir
      if (token && barberiaId) {
        const barberoId = localStorage.getItem('barbero_id');
        const rol = localStorage.getItem('barbero_rol');
        
        if (rol === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }
        
        if (rol === 'owner') {
          navigate(`/barberia/${barberiaId}/dashboard`, { replace: true });
          return;
        }
        
        if (rol === 'barbero') {
          navigate(`/barbero/${barberiaId}/${barberoId}`, { replace: true });
          return;
        }
      }
      
      // Si hay barbería guardada, ir a ella
      const barberiaGuardada = localStorage.getItem('barberia_actual');
      if (barberiaGuardada) {
        navigate(`/barberia/${barberiaGuardada}`, { replace: true });
        return;
      }
      
      // Si nada de lo anterior, mostrar lista de barberías
      cargarBarberias();
    };
    
    verificarYRedigir();
  }, [searchParams]);

  const cargarBarberias = async () => {
    try {
      const data = await api.getBarberias();
      setBarberias(data);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    localStorage.removeItem('barbero_rol');
    localStorage.removeItem('barberia_actual');
    window.location.href = '/';
  };

  const tieneToken = !!localStorage.getItem('barbero_token');

  if (loading || redirecting) {
    return (
      <div className="page home-page">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="page home-page">
      <div className="hero">
        <div className="hero-icon">✂️</div>
        <h1>BarberApp</h1>
        <p>Escanea el código QR de tu barbería para comenzar</p>
      </div>

      <div className="barberia-list">
        <h2 className="section-title">Tus barberías</h2>
        {barberias.length === 0 ? (
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

      {tieneToken && (
        <button className="btn-cerrar-sesion" onClick={handleLogout}>
          Cerrar sesión
        </button>
      )}
    </div>
  );
}

export default Home;
