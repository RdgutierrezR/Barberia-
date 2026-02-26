import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modo, setModo] = useState('login');
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    contrasena: '',
    id_barberia: ''
  });

  useEffect(() => {
    api.getBarberias().then(setBarberias).catch(() => {
      setError('No se pudieron cargar las barberías');
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (modo === 'login') {
        const res = await fetch(`${API_URL}/auth/barbero/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: formData.correo,
            contrasena: formData.contrasena,
            id_barberia: formData.id_barberia ? parseInt(formData.id_barberia) : null
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Error al iniciar sesión');
        } else {
          console.log('Login exitoso, guardando token:', data.token);
          localStorage.setItem('barbero_token', data.token);
          localStorage.setItem('barbero_id', data.barbero.id_barbero);
          localStorage.setItem('barbero_nombre', data.barbero.nombre);
          localStorage.setItem('barberia_id', data.barbero.id_barberia);
          navigate(`/barbero/${data.barbero.id_barberia}/${data.barbero.id_barbero}`);
        }
      } else {
        if (!formData.nombre || !formData.telefono || !formData.correo || !formData.contrasena || !formData.id_barberia) {
          setError('Todos los campos son obligatorios');
          setLoading(false);
          return;
        }
        
        const res = await fetch(`${API_URL}/auth/barbero/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            telefono: formData.telefono,
            correo: formData.correo,
            contrasena: formData.contrasena,
            id_barberia: parseInt(formData.id_barberia)
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Error al registrarte');
        } else {
          localStorage.setItem('barbero_token', data.token);
          localStorage.setItem('barbero_id', data.barbero.id_barbero);
          localStorage.setItem('barbero_nombre', data.barbero.nombre);
          localStorage.setItem('barberia_id', data.barbero.id_barberia);
          navigate(`/barbero/${data.barbero.id_barberia}/${data.barbero.id_barbero}`);
        }
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">✂️</div>
          <h1>BarberApp</h1>
          <p>{modo === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta de barbero'}</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${modo === 'login' ? 'active' : ''}`}
            onClick={() => { setModo('login'); setError(''); }}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`tab ${modo === 'registro' ? 'active' : ''}`}
            onClick={() => { setModo('registro'); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {modo === 'registro' && (
            <>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required={modo === 'registro'}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                  required={modo === 'registro'}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Barbería</label>
            <select 
              name="id_barberia" 
              value={formData.id_barberia} 
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu barbería</option>
              {barberias.map(b => (
                <option key={b.id_barberia} value={b.id_barberia}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <button className="back-home" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

const API_URL = 'http://192.168.1.86:5000/api';

export default Login;
