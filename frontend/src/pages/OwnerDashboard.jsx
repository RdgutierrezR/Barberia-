import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FRONTEND_URL } from '../config';
import { parsearFecha } from '../utils/fecha';

function OwnerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barberia, setBarberia] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [nuevoBarbero, setNuevoBarbero] = useState({ nombre: '', telefono: '', correo: '', contrasena: '' });

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
      const b = await api.getBarberia(id);
      setBarberia(b);
      const bs = await api.getTodosBarberos(id);
      setBarberos(bs.filter(b => b.rol !== 'owner'));
      const t = await api.getTurnos(id);
      setTurnos(t);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const formatFechaColombia = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const fecha = parsearFecha(fechaStr);
    if (!fecha) return 'Sin fecha';
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    let hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}, ${hora}:${minuto} ${ampm}`;
  };

  const agregarBarbero = async () => {
    if (!nuevoBarbero.nombre || !nuevoBarbero.telefono || !nuevoBarbero.correo || !nuevoBarbero.contrasena) {
      return;
    }
    try {
      await api.registroBarbero(id, { ...nuevoBarbero, rol: 'barbero' });
      setShowModal(false);
      setNuevoBarbero({ nombre: '', telefono: '', correo: '', contrasena: '' });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarBarbero = async (idBarbero) => {
    if (!confirm('Estas seguro de eliminar este barbero?')) return;
    try {
      await api.eliminarBarbero(id, idBarbero);
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

  if (loading) return <div className="page"><div className="loading">Cargando...</div></div>;

  return (
    <div className="owner-page">
      <div className="owner-header">
        <div className="owner-header-top">
          <div className="owner-header-info">
            <h1>{barberia?.nombre || 'Mi Barberia'}</h1>
            <p>Panel de Owner</p>
          </div>
          <button className="admin-logout" onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="owner-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{barberos.length}</div>
            <div className="stat-label">Barberos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{barberia?.codigo_qr_base || 'N/A'}</div>
            <div className="stat-label">Codigo QR</div>
          </div>
        </div>
      </div>

      <div className="owner-section">
        <h2>Codigo QR</h2>
        <div className="qr-section" onClick={() => setShowQR(!showQR)}>
          <div className="qr-code">
            {barberia?.id_barberia ? (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${FRONTEND_URL}/barberia/${barberia.id_barberia}`} 
                alt="QR Code" 
              />
            ) : (
              <span>Sin codigo</span>
            )}
          </div>
          <p className="qr-instruction">
            {showQR ? 'Toca para ocultar' : 'Toca para mostrar el QR'}
          </p>
          <p className="qr-url">{FRONTEND_URL}/barberia/{barberia?.id_barberia}</p>
        </div>
      </div>

      <div className="owner-section">
        <h2>Mis Barberos</h2>
        <div className="barbero-list">
          {barberos.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No hay barberos registrados</p>
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
          <button className="btn-agregar" onClick={() => setShowModal(true)}>
            + Agregar Barbero
          </button>
        </div>
      </div>

      <div className="owner-section">
        <h2>Turnos Recientes</h2>
        <div className="turnos-list">
          {turnos.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No hay turnos</p>
          ) : (
            turnos.slice(0, 10).map(t => (
              <div key={t.id_turno} className="turno-item">
                <div className="turno-info">
                  <div className="turno-cliente">{t.cliente_nombre || 'Sin nombre'}</div>
                  <div className="turno-servicio">{t.servicio_nombre}</div>
                  <div className="turno-fecha">{formatFechaColombia(t.fecha_hora)}</div>
                </div>
                <div className={`turno-estado ${t.estado}`}>{t.estado}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
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
              <label>Telefono</label>
              <input
                type="tel"
                value={nuevoBarbero.telefono}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, telefono: e.target.value })}
                placeholder="Telefono"
              />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                value={nuevoBarbero.correo}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, correo: e.target.value })}
                placeholder="Correo electronico"
              />
            </div>
            <div className="form-group">
              <label>Contrasena</label>
              <input
                type="password"
                value={nuevoBarbero.contrasena}
                onChange={e => setNuevoBarbero({ ...nuevoBarbero, contrasena: e.target.value })}
                placeholder="Contrasena"
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancelar-modal" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-confirmar-modal" onClick={agregarBarbero}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
