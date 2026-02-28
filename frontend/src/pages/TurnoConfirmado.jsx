import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function TurnoConfirmado() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const buscarTurno = async () => {
      const barberiaGuardada = localStorage.getItem('barberia_actual');
      const barberiaId = barberiaGuardada || 1;
      
      try {
        const t = await api.getTurnoPorCodigo(barberiaId, codigo);
        if (!t.error) {
          setTurno(t);
          setLoading(false);
          return;
        }
      } catch (e) {}
      setLoading(false);
    };
    buscarTurno();
    
    const interval = setInterval(buscarTurno, 3000);
    return () => clearInterval(interval);
  }, [codigo]);

  const handleCancelar = async () => {
    if (!confirm('¿Estás seguro de cancelar tu turno?')) return;
    
    const barberiaId = localStorage.getItem('barberia_actual') || 1;
    setCancelando(true);
    
    try {
      await api.cancelarTurno(barberiaId, turno.id_turno);
      localStorage.removeItem('barberia_actual');
      navigate(`/barberia/${turno.id_barberia}`);
    } catch (e) {
      alert('Error al cancelar turno');
      setCancelando(false);
    }
  };

  if (loading) return <div className="page"><div className="loading">Buscando turno...</div></div>;
  if (!turno) return <div className="page"><div className="error">Turno no encontrado</div></div>;

  const getMensajeEstado = () => {
    switch(turno.estado) {
      case 'pendiente': return 'Estas en espera';
      case 'confirmado': return 'Te confirman pronto';
      case 'en_proceso': return 'Es tu turno!';
      case 'completado': return 'Turno completado';
      case 'cancelado': return 'Turno cancelado';
      default: return turno.estado;
    }
  };

  const getMensajePosicion = () => {
    if (turno.estado === 'en_proceso') return 'Ya te estamos atendiendo!';
    if (turno.estado === 'completado') return 'Gracias por visitarnos!';
    if (!turno.posicion) return 'Calculando posición...';
    if (turno.turnos_adelante === 0) return 'Eres el siguiente!';
    return `Tienes ${turno.turnos_adelante} ${turno.turnos_adelante === 1 ? 'turno' : 'turnos'} adelante`;
  };

  return (
    <div className="page">
      <div className="turno-confirmado">
        <div className="check-icon">✓</div>
        <h1>Turno Confirmado!</h1>
        
        <div className="codigo-turno">
          <p>Tu código:</p>
          <h2>{turno.codigo_confirmacion}</h2>
        </div>

        {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
          <div className="posicion-card">
            <div className="posicion-numero">{turno.posicion || '-'}</div>
            <div className="posicion-texto">Posición en cola</div>
            <div className="posicion-mensaje">{getMensajePosicion()}</div>
          </div>
        )}

        <div className="turno-detalles">
          <div className="detalle">
            <span>Barbero</span>
            <strong>{turno.barbero_nombre}</strong>
          </div>
          <div className="detalle">
            <span>Servicio</span>
            <strong>{turno.servicio_nombre}</strong>
          </div>
          <div className="detalle">
            <span>Precio</span>
            <strong>${turno.servicio_precio?.toLocaleString()}</strong>
          </div>
        </div>

        <div className={`estado ${turno.estado}`}>
          <p>{getMensajeEstado()}</p>
        </div>

        {turno.estado === 'completado' && (
          <button className="btn-primary" onClick={() => navigate('/')}>
            Nuevo Turno
          </button>
        )}

        {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
            <button 
              className="btn-cancelar" 
              onClick={handleCancelar}
              disabled={cancelando}
            >
              {cancelando ? 'Cancelando...' : 'Cancelar turno'}
            </button>
          )}
      </div>
    </div>
  );
}

export default TurnoConfirmado;
