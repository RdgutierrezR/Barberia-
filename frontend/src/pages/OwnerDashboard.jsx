import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FRONTEND_URL } from '../config';

function OwnerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [barberia, setBarberia] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModalBarbero, setShowModalBarbero] = useState(false);
  const [showModalServicio, setShowModalServicio] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  const [nuevoBarbero, setNuevoBarbero] = useState({ nombre: '', telefono: '', correo: '', contrasena: '' });
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' });

  useEffect(() => {
    const token = localStorage.getItem('barbero_token');
    const rol = localStorage.getItem('barbero_rol');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [b, bs, s, t] = await Promise.all([
        api.getBarberia(id),
        api.getTodosBarberos(id),
        api.getServicios(id),
        api.getTurnos(id)
      ]);
      setBarberia(b);
      setBarberos(bs.filter(b => b.rol !== 'owner' && b.rol !== 'admin'));
      setServicios(s);
      setTurnos(t);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const agregarBarbero = async () => {
    if (!nuevoBarbero.nombre || !nuevoBarbero.telefono || !nuevoBarbero.correo || !nuevoBarbero.contrasena) {
      return;
    }
    try {
      await api.registroBarbero(id, { ...nuevoBarbero, rol: 'barbero' });
      setShowModalBarbero(false);
      setNuevoBarbero({ nombre: '', telefono: '', correo: '', contrasena: '' });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarBarbero = async (idBarbero) => {
    if (!confirm('¿Estás seguro de eliminar este barbero?')) return;
    try {
      await api.eliminarBarbero(id, idBarbero);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const guardarServicio = async () => {
    if (!nuevoServicio.nombre || !nuevoServicio.precio || !nuevoServicio.duracion_minutos) {
      return;
    }
    try {
      if (editandoServicio) {
        await api.actualizarServicio(id, editandoServicio.id_servicio, nuevoServicio);
      } else {
        await api.crearServicio(id, nuevoServicio);
      }
      setShowModalServicio(false);
      setNuevoServicio({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' });
      setEditandoServicio(null);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const editarServicio = (servicio) => {
    setNuevoServicio({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio,
      duracion_minutos: servicio.duracion_minutos
    });
    setEditandoServicio(servicio);
    setShowModalServicio(true);
  };

  const eliminarServicio = async (idServicio) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await api.eliminarServicio(id, idServicio);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    localStorage.removeItem('barbero_rol');
    navigate('/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  if (loading) return <div className="page"><div className="loading">Cargando...</div></div>;

  return (
    <div className="owner-page">
      <div className="owner-header">
        <div className="owner-header-top">
          <div className="owner-header-info">
            <h1>{barberia?.nombre || 'Mi Barbería'}</h1>
            <p>Panel de Owner</p>
          </div>
          <button className="admin-logout" onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="owner-tabs">
        <button 
          className={`owner-tab ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          🏠 Inicio
        </button>
        <button 
          className={`owner-tab ${activeTab === 'barberos' ? 'active' : ''}`}
          onClick={() => setActiveTab('barberos')}
        >
          👥 Barberos
        </button>
      </div>

      {activeTab === 'inicio' && (
        <div className="owner-content">
          <div className="owner-section">
            <h2>Código QR</h2>
            <div className="qr-section" onClick={() => setShowQR(!showQR)}>
              <div className="qr-code">
                {barberia?.id_barberia ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${FRONTEND_URL}/barberia/${barberia.id_barberia}`} 
                    alt="QR Code" 
                  />
                ) : (
                  <span>Sin código</span>
                )}
              </div>
              <p className="qr-instruction">
                {showQR ? 'Toca para ocultar' : 'Toca para mostrar el QR'}
              </p>
              <p className="qr-url">{FRONTEND_URL}/barberia/{barberia?.id_barberia}</p>
            </div>
          </div>

          <div className="owner-section">
            <div className="section-header">
              <h2>Mis Servicios</h2>
              <button className="btn-agregar-small" onClick={() => {
                setEditandoServicio(null);
                setNuevoServicio({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' });
                setShowModalServicio(true);
              }}>
                + Nuevo
              </button>
            </div>
            <div className="servicios-grid">
              {servicios.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No hay servicios</p>
              ) : (
                servicios.map(s => (
                  <div key={s.id_servicio} className="servicio-card-crud">
                    <div className="servicio-info-crud">
                      <div className="servicio-nombre-crud">{s.nombre}</div>
                      <div className="servicio-precio-crud">{formatCurrency(s.precio)}</div>
                      <div className="servicio-duracion-crud">{s.duracion_minutos} min</div>
                    </div>
                    <div className="servicio-actions-crud">
                      <button onClick={() => editarServicio(s)}>✏️</button>
                      <button onClick={() => eliminarServicio(s.id_servicio)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="owner-section">
            <h2>Estadísticas</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{barberos.length}</div>
                <div className="stat-label">Barberos</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{servicios.length}</div>
                <div className="stat-label">Servicios</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{turnos.length}</div>
                <div className="stat-label">Turnos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'barberos' && (
        <div className="owner-content">
          <div className="owner-section">
            <div className="section-header">
              <h2>Mis Barberos</h2>
              <button className="btn-agregar-small" onClick={() => setShowModalBarbero(true)}>
                + Nuevo
              </button>
            </div>
            <div className="barbero-list">
              {barberos.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No hay barberos</p>
              ) : (
                barberos.map(b => (
                  <div key={b.id_barbero} className="barbero-item">
                    <div className="barbero-item-foto">👤</div>
                    <div className="barbero-item-info">
                      <div className="barbero-item-nombre">{b.nombre}</div>
                      <div className="barbero-item-rol">{b.activo ? 'Activo' : 'Inactivo'}</div>
                    </div>
                    <div className="barbero-item-actions">
                      <button className="btn-eliminar" onClick={() => eliminarBarbero(b.id_barbero)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showModalBarbero && (
        <div className="modal-overlay" onClick={() => setShowModalBarbero(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Agregar Barbero</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={nuevoBarbero.nombre}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, nombre: e.target.value })}
                placeholder="Nombre del barbero"
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={nuevoBarbero.telefono}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, telefono: e.target.value })}
                placeholder="Teléfono"
              />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                value={nuevoBarbero.correo}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, correo: e.target.value })}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={nuevoBarbero.contrasena}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, contrasena: e.target.value })}
                placeholder="Contraseña"
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setShowModalBarbero(false)}>Cancelar</button>
              <button className="btn-confirmar-modal" onClick={agregarBarbero}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {showModalServicio && (
        <div className="modal-overlay" onClick={() => setShowModalServicio(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editandoServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={nuevoServicio.nombre}
                onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={nuevoServicio.descripcion}
                onChange={e => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })}
                placeholder="Descripción (opcional)"
              />
            </div>
            <div className="form-group">
              <label>Precio ($)</label>
              <input
                type="number"
                value={nuevoServicio.precio}
                onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
                placeholder="Precio"
              />
            </div>
            <div className="form-group">
              <label>Duración (minutos)</label>
              <input
                type="number"
                value={nuevoServicio.duracion_minutos}
                onChange={e => setNuevoServicio({ ...nuevoServicio, duracion_minutos: e.target.value })}
                placeholder="Duración en minutos"
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setShowModalServicio(false)}>Cancelar</button>
              <button className="btn-confirmar-modal" onClick={guardarServicio}>
                {editandoServicio ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
