import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);
  
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    nombre: '',
    telefono: '',
    nombre_barberia: '',
    direccion: '',
    telefono_barberia: '',
    codigo_invitacion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleValidarCodigo = async () => {
    if (!formData.codigo_invitacion) {
      setError('Ingresa el codigo de invitacion');
      return;
    }
    setLoading(true);
    try {
      const result = await api.validarInvitacion(formData.codigo_invitacion);
      if (result.valido) {
        setCodigoValidado(true);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Codigo invalido');
      setCodigoValidado(false);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (modo === 'login') {
        const data = await api.loginBarbero(formData.correo, formData.contrasena);
        
        localStorage.setItem('barbero_token', data.token);
        localStorage.setItem('barbero_id', data.barbero.id_barbero);
        localStorage.setItem('barbero_nombre', data.barbero.nombre);
        localStorage.setItem('barberia_id', data.barbero.id_barberia);
        localStorage.setItem('barbero_rol', data.barbero.rol);

        if (data.barbero.rol === 'admin') {
          navigate('/admin');
        } else if (data.barbero.rol === 'owner') {
          navigate(`/barberia/${data.barbero.id_barberia}/dashboard`);
        } else {
          navigate(`/barbero/${data.barbero.id_barberia}/${data.barbero.id_barbero}`);
        }
      } else {
        if (!codigoValidado) {
          setError('Valida el codigo de invitacion primero');
          setLoading(false);
          return;
        }

        const data = await api.registroBarberia({
          codigo_invitacion: formData.codigo_invitacion,
          nombre_barberia: formData.nombre_barberia,
          nombre_barbero: formData.nombre,
          telefono: formData.telefono,
          correo: formData.correo,
          contrasena: formData.contrasena,
          direccion: formData.direccion,
          telefono_barberia: formData.telefono_barberia
        });

        localStorage.setItem('barbero_token', data.token);
        localStorage.setItem('barbero_id', data.barbero.id_barbero);
        localStorage.setItem('barbero_nombre', data.barbero.nombre);
        localStorage.setItem('barberia_id', data.barbero.id_barberia);
        localStorage.setItem('barbero_rol', data.barbero.rol);

        navigate(`/barberia/${data.barbero.id_barberia}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">✂️</div>
          <h1>BarberApp</h1>
          <p>{modo === 'login' ? 'Inicia sesion en tu cuenta' : 'Crea tu barberia'}</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${modo === 'login' ? 'active' : ''}`}
            onClick={() => { setModo('login'); setError(''); setCodigoValidado(false); }}
          >
            Iniciar Sesion
          </button>
          <button 
            className={`tab ${modo === 'registro' ? 'active' : ''}`}
            onClick={() => { setModo('registro'); setError(''); setCodigoValidado(false); }}
          >
            Crear Barberia
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {modo === 'registro' && (
            <>
              <div className="form-group">
                <label>Codigo de invitacion</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="codigo_invitacion"
                    value={formData.codigo_invitacion}
                    onChange={handleChange}
                    placeholder="Ingresa el codigo"
                    disabled={codigoValidado}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleValidarCodigo}
                    disabled={loading || codigoValidado}
                    style={{ 
                      padding: '14px 16px', 
                      background: codigoValidado ? '#4ade80' : '#fff', 
                      color: '#000',
                      border: 'none', 
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: codigoValidado ? 'default' : 'pointer'
                    }}
                  >
                    {codigoValidado ? '✓' : 'Validar'}
                  </button>
                </div>
              </div>

              {codigoValidado && (
                <>
                  <div className="form-group">
                    <label>Nombre de tu barberia</label>
                    <input
                      type="text"
                      name="nombre_barberia"
                      value={formData.nombre_barberia}
                      onChange={handleChange}
                      placeholder="Ej: Barberia Los Pibes"
                      required={modo === 'registro'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Direccion</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Direccion de la barberia"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefono de la barberia</label>
                    <input
                      type="tel"
                      name="telefono_barberia"
                      value={formData.telefono_barberia}
                      onChange={handleChange}
                      placeholder="3001234567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tu nombre completo</label>
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
                    <label>Tu telefono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Tu numero de telefono"
                      required={modo === 'registro'}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="form-group">
            <label>Correo electronico</label>
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
            <label>Contrasena</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading || (modo === 'registro' && !codigoValidado)}>
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar Sesion' : 'Crear Barberia'}
          </button>
        </form>

        <button className="back-home" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default Login;
