import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthInit } from '../hooks/useAuthInit';
import { FRONTEND_URL } from '../config';
import { Home, Users, Edit2, Trash2, User, Check, X, Loader2 } from 'lucide-react';
import { alertaError, alertaExito, confirmarAccion } from '../utils/alerts';
import { cancelarSuscripcionPush } from '../utils/pushNotifications';

function OwnerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [barberia, setBarberia] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [resumenTurnos, setResumenTurnos] = useState({ total_activos: 0, hoy_activos: 0 });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const abortControllersRef = useRef([]);
  
  const { inicializado, tokenValido, crearAbortController } = useAuthInit();
  
  const [showModalBarbero, setShowModalBarbero] = useState(false);
  const [showModalServicio, setShowModalServicio] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [barberoEditandoPassword, setBarberoEditandoPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  
  const [nuevoBarbero, setNuevoBarbero] = useState({ nombre: '', telefono: '', correo: '', contrasena: '', comision_monto: 0 });
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' });
  const [barberoEditando, setBarberoEditando] = useState(null);
  const [barberoEditandoNombre, setBarberoEditandoNombre] = useState(null);
  const [nombreEditando, setNombreEditando] = useState('');
  const [guardandoBarbero, setGuardandoBarbero] = useState(false);
  const [guardandoComisionId, setGuardandoComisionId] = useState(null);
  const [guardandoNombreId, setGuardandoNombreId] = useState(null);

  const logout = async () => {
    const token = localStorage.getItem('barbero_token');
    
    if (token) {
      try {
        await cancelarSuscripcionPush(token);
      } catch (e) {
        console.error('[LOGOUT] Error eliminando push:', e);
      }
    }
    
    localStorage.removeItem('barbero_token');
    localStorage.removeItem('barbero_id');
    localStorage.removeItem('barbero_nombre');
    localStorage.removeItem('barberia_id');
    localStorage.removeItem('barbero_rol');
    navigate('/login');
  };

  const cargarDatos = async () => {
    if (!mountedRef.current) return;
    
    const controller = crearAbortController();
    abortControllersRef.current.push(controller);
    
    try {
      const [b, bs, s, r] = await Promise.all([
        api.getBarberia(id),
        api.getTodosBarberos(id),
        api.getServicios(id),
        api.getResumenTurnos(id)
      ]);
      if (!mountedRef.current) return;
      
      setBarberia(b);
      setBarberos(bs.filter(b => b.rol !== 'owner' && b.rol !== 'admin'));
      setServicios(s);
      setResumenTurnos(r);
    } catch (err) {
      if (!mountedRef.current) return;
      if (err.name === 'AbortError' || err.message.includes('canceled')) return;
      console.error(err);
    }
    setLoading(false);
  };

  const recargarParcial = async () => {
    if (!mountedRef.current) return;
    
    const controller = crearAbortController();
    abortControllersRef.current.push(controller);
    
    try {
      const [bs, s] = await Promise.all([
        api.getTodosBarberos(id),
        api.getServicios(id)
      ]);
      if (!mountedRef.current) return;
      
      setBarberos(bs.filter(b => b.rol !== 'owner' && b.rol !== 'admin'));
      setServicios(s);
    } catch (err) {
      if (!mountedRef.current) return;
      if (err.name === 'AbortError' || err.message.includes('canceled')) return;
      console.error(err);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    if (!inicializado) return;
    
    if (!tokenValido) {
      navigate('/login');
      return;
    }
    
    cargarDatos();

    return () => {
      mountedRef.current = false;
      const controllers = abortControllersRef.current;
      controllers.forEach(c => {
        try { c.abort(); } catch {/* empty */}
      });
    };
  }, [inicializado, tokenValido, id, navigate, cargarDatos]);

  const agregarBarbero = async () => {
    if (!nuevoBarbero.nombre || !nuevoBarbero.telefono || !nuevoBarbero.correo || !nuevoBarbero.contrasena) {
      return;
    }
    setGuardandoBarbero(true);
    try {
      await api.registroBarbero(id, { 
        ...nuevoBarbero, 
        rol: 'barbero',
        comision_monto: Number(nuevoBarbero.comision_monto) || 0
      });
      setShowModalBarbero(false);
      setNuevoBarbero({ nombre: '', telefono: '', correo: '', contrasena: '', comision_monto: 0 });
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
    }
    setGuardandoBarbero(false);
  };

  const guardarComision = async (idBarbero, comision) => {
    setGuardandoComisionId(idBarbero);
    try {
      await api.actualizarBarbero(id, idBarbero, { comision_monto: Number(comision) || 0 });
      setBarberoEditando(null);
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
    }
    setGuardandoComisionId(null);
  };

  const editarNombre = (barbero) => {
    setBarberoEditandoNombre(barbero.id_barbero);
    setNombreEditando(barbero.nombre);
  };

  const guardarBarberoNombre = async (idBarbero) => {
    if (!nombreEditando.trim()) {
      setBarberoEditandoNombre(null);
      return;
    }
    setGuardandoNombreId(idBarbero);
    try {
      await api.actualizarBarbero(id, idBarbero, { nombre: nombreEditando.trim() });
      setBarberoEditandoNombre(null);
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
    }
    setGuardandoNombreId(null);
  };

  const eliminarBarbero = async (idBarbero) => {
    if (!await confirmarAccion('Eliminar barbero', '¿Estás seguro de eliminar este barbero?')) return;
    try {
      await api.eliminarBarbero(id, idBarbero);
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
    }
  };

  const abrirModalPassword = (barbero) => {
    setBarberoEditandoPassword(barbero);
    setNuevaPassword('');
    setShowModalPassword(true);
  };

  const guardarPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 4) {
      alertaError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    try {
      await api.actualizarContrasenaBarbero(id, barberoEditandoPassword.id_barbero, nuevaPassword);
      setShowModalPassword(false);
      setBarberoEditandoPassword(null);
      setNuevaPassword('');
      alertaExito('Contraseña actualizada correctamente');
    } catch (err) {
      alertaError(err.message);
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
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
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
    if (!await confirmarAccion('Eliminar servicio', '¿Estás seguro de eliminar este servicio?')) return;
    try {
      await api.eliminarServicio(id, idServicio);
      recargarParcial();
    } catch (err) {
      alertaError(err.message);
    }
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
          <Home size={16} /> Inicio
        </button>
        <button 
          className={`owner-tab ${activeTab === 'barberos' ? 'active' : ''}`}
          onClick={() => setActiveTab('barberos')}
        >
          <Users size={16} /> Barberos
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
                      <button onClick={() => editarServicio(s)}><Edit2 size={14} /></button>
                      <button onClick={() => eliminarServicio(s.id_servicio)}><Trash2 size={14} /></button>
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
                <div className="stat-value">{resumenTurnos.hoy_activos}</div>
                <div className="stat-label">Turnos Hoy</div>
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
                    <div className="barbero-item-foto"><User size={24} /></div>
                    <div className="barbero-item-info">
                      {barberoEditandoNombre === b.id_barbero ? (
                        <div className="barbero-item-nombre-editing">
                          <input
                            type="text"
                            value={nombreEditando}
                            onChange={(e) => setNombreEditando(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') guardarBarberoNombre(b.id_barbero);
                              if (e.key === 'Escape') setBarberoEditandoNombre(null);
                            }}
                            autoFocus
                          />
                          <button className="btn-comision-confirmar" onClick={() => guardarBarberoNombre(b.id_barbero)} title="Guardar nombre" disabled={guardandoNombreId === b.id_barbero}>
                            {guardandoNombreId === b.id_barbero ? <Loader2 size={14} className="icon-spin" /> : <Check size={14} />}
                          </button>
                          <button className="btn-comision-cancelar" onClick={() => setBarberoEditandoNombre(null)} title="Cancelar" disabled={guardandoNombreId === b.id_barbero}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="barbero-item-nombre">
                          {b.nombre}
                          <button className="btn-editar-icono" onClick={() => editarNombre(b)} title="Editar nombre">
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                      <div className="barbero-item-rol">
                        {b.activo ? 'Activo' : 'Inactivo'} 
                        {b.comision_monto > 0 && <span style={{ marginLeft: '8px', color: '#2ecc71' }}>• ${Number(b.comision_monto).toLocaleString()} por servicio</span>}
                        {b.comision_monto == 0 && <span style={{ marginLeft: '8px', color: '#999' }}>• Sin comisión</span>}
                      </div>
                    </div>
                    <div className="barbero-item-actions">
                      {barberoEditando === b.id_barbero ? (
                        <span className="comision-edit-container">
                          <input
                            type="number"
                            className="comision-edit-input"
                            defaultValue={b.comision_monto}
                            onKeyDown={(e) => e.key === 'Enter' && guardarComision(b.id_barbero, e.target.value)}
                            autoFocus
                          />
                          <button className="btn-comision-confirmar" onClick={(e) => {
                            const input = e.currentTarget.parentElement.querySelector('input');
                            guardarComision(b.id_barbero, input.value);
                          }} title="Guardar comisión" disabled={guardandoComisionId === b.id_barbero}>
                            {guardandoComisionId === b.id_barbero ? <Loader2 size={14} className="icon-spin" /> : <Check size={14} />}
                          </button>
                          <button className="btn-comision-cancelar" onClick={() => setBarberoEditando(null)} title="Cancelar" disabled={guardandoComisionId === b.id_barbero}>
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <button className="btn-editar" onClick={() => setBarberoEditando(b.id_barbero)} title="Editar comisión">💰</button>
                      )}
                      <button className="btn-editar" onClick={() => abrirModalPassword(b)}>🔑</button>
                      <button className="btn-eliminar" onClick={() => eliminarBarbero(b.id_barbero)}><Trash2 size={14} /></button>
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
            <div className="form-group">
              <label>Comisión por servicio ($)</label>
              <input
                type="number"
                value={nuevoBarbero.comision_monto}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, comision_monto: e.target.value })}
                placeholder="0 = sin comisión"
                min="0"
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Monto que recibe el barbero por cada servicio. 0 = sin comisión</small>
            </div>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setShowModalBarbero(false)} disabled={guardandoBarbero}>Cancelar</button>
              <button className="btn-confirmar-modal" onClick={agregarBarbero} disabled={guardandoBarbero}>
                {guardandoBarbero && <span className="spinner"></span>}
                {guardandoBarbero ? 'Guardando...' : 'Agregar'}
              </button>
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

      {showModalPassword && (
        <div className="modal-overlay" onClick={() => setShowModalPassword(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Cambiar Contraseña</h3>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Barbero: <strong>{barberoEditandoPassword?.nombre}</strong>
            </p>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={e => setNuevaPassword(e.target.value)}
                placeholder="Nueva contraseña"
                minLength={4}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setShowModalPassword(false)}>Cancelar</button>
              <button className="btn-confirmar-modal" onClick={guardarPassword}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
