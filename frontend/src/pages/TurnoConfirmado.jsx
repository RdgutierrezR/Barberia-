import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { parsearFecha } from '../utils/fecha';
import { Calendar, MapPin } from 'lucide-react';

function TurnoConfirmado() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [turno, setTurno] = useState(() => location.state?.turno || null);
  const [loading, setLoading] = useState(!location.state?.turno);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const params = new URLSearchParams(window.location.search);
    const barberiaUrl = params.get('barberia');
    const barberiaGuardada = localStorage.getItem('barberia_actual');
    const barberiaId = barberiaUrl || location.state?.id_barberia || barberiaGuardada || 1;
    
    console.log('[DEBUG] Buscando turno:', { 
      codigo, 
      barberiaUrl, 
      barberiaState: location.state?.id_barberia,
      barberiaLocal: barberiaGuardada, 
      barberiaId 
    });

    const buscarTurno = async (reintentos = 3) => {
      for (let i = 0; i < reintentos; i++) {
        if (cancelado) return;
        try {
          const t = await api.getTurnoPorCodigo(barberiaId, codigo);
          if (!cancelado && !t.error) {
            setTurno(t);
            setLoading(false);
            return true;
          }
        } catch {
          if (cancelado) return;
          if (i < reintentos - 1) {
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
          }
        }
      }
      if (!cancelado && !turno) setLoading(false);
      return false;
    };

    if (location.state?.turno) {
      buscarTurno(1);
    } else {
      buscarTurno(5);
    }

    const interval = setInterval(() => buscarTurno(1), 8000);
    return () => { cancelado = true; clearInterval(interval); };
  }, [codigo]);

  const handleCancelar = async () => {
    if (!confirm('¿Estás seguro de cancelar tu turno?')) return;
    
    const barberiaId = location.state?.id_barberia || localStorage.getItem('barberia_actual') || 1;
    setCancelando(true);
    
    try {
      await api.cancelarTurno(barberiaId, turno.id_turno);
      localStorage.removeItem('barberia_actual');
      navigate(`/barberia/${turno.id_barberia}`);
    } catch {
      alert('Error al cancelar turno');
      setCancelando(false);
    }
  };

  if (loading) return <div className="page"><div className="loading">Confirmando tu turno...</div></div>;
  if (!turno) return (
    <div className="page">
      <div className="error">
        <p>No pudimos encontrar tu turno</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    </div>
  );

  const esCita = turno.tipo_reserva === 'cita';
  const tieneHora = turno.cita_fecha_hora;

  const formatFechaHoraDisplay = (fechaStr) => {
    const fecha = parsearFecha(fechaStr);
    if (!fecha) return '';
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
            <div className="check-icon"><Calendar size={32} /></div>
            <h1>Turno Agendado!</h1>
            
            <div className="codigo-turno">
              <p>Tu código:</p>
              <h2>{turno.codigo_confirmacion}</h2>
            </div>

            <div className="cita-info-card">
              <div className="cita-fecha">
                <span className="cita-label">Fecha y hora</span>
                <span className="cita-valor">{tieneHora ? formatFechaHoraDisplay(turno.cita_fecha_hora) : 'Por confirmar'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="check-icon"><MapPin size={32} /></div>
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
