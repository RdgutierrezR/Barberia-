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
    
    const interval = setInterval(buscarTurno, 5000);
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

  const esCita = turno.tipo_reserva === 'cita';
  const tieneHora = turno.cita_fecha_hora;

  const formatFechaHora = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    let hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${dia} de ${mes} de ${anio}, ${hora}:${minuto} ${ampm}`;
  };

  return (
    <div className="page">
      <div className="turno-confirmado">
        {esCita ? (
          <>
            <div className="check-icon">📅</div>
            <h1>Turno Agendado!</h1>
            
            <div className="codigo-turno">
              <p>Tu código:</p>
              <h2>{turno.codigo_confirmacion}</h2>
            </div>

            <div className="cita-info-card">
              <div className="cita-fecha">
                <span className="cita-label">Fecha y hora</span>
                <span className="cita-valor">{tieneHora ? formatFechaHora(turno.cita_fecha_hora) : 'Por confirmar'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="check-icon">📍</div>
            <h1>En la Cola!</h1>
            
            <div className="codigo-turno">
              <p>Tu código:</p>
              <h2>{turno.codigo_confirmacion}</h2>
            </div>

            {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
              <div className="posicion-card">
                <div className="posicion-numero">{turno.posicion || '-'}</div>
                <div className="posicion-texto">Posición en cola</div>
                <div className="posicion-mensaje">
                  {turno.estado === 'en_proceso' ? 'Ya te estamos atendiendo!' :
                   turno.turnos_adelante === 0 ? 'Eres el siguiente!' :
                   `${turno.turnos_adelante} ${turno.turnos_adelante === 1 ? 'turno' : 'turnos'} adelante`}
                </div>
              </div>
            )}
          </>
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
          {turno.estado === 'pendiente' && (esCita ? 'Esperando tu hora' : 'En espera')}
          {turno.estado === 'confirmado' && 'Confirmado'}
          {turno.estado === 'en_proceso' && 'Es tu turno!'}
          {turno.estado === 'completado' && 'Turno completado'}
          {turno.estado === 'cancelado' && 'Turno cancelado'}
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
