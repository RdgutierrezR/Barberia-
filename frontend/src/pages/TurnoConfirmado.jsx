import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { parsearFecha } from '../utils/fecha';
import { Calendar, MapPin, Bell, BellOff } from 'lucide-react';
import { pushSoportado, solicitarPermisoPush, suscribirseAPushCliente } from '../utils/pushNotifications';
import { alertaError, confirmarAccion } from '../utils/alerts';

const formatHora12h = (hora24) => {
  if (!hora24) return '';
  const [hora, minuto] = hora24.split(':');
  let h = parseInt(hora);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${minuto} ${ampm}`;
};

const calcularRangoEspera = (turnosAdelante, servicioDuracion) => {
  if (!turnosAdelante || turnosAdelante <= 0 || !servicioDuracion) return null;
  const estimado = turnosAdelante * servicioDuracion;
  return {
    minimo: Math.max(5, estimado - 15),
    maximo: estimado + 15
  };
};

const formatParte = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const formatRangoEspera = ({ minimo, maximo }) => {
  const desde = formatParte(minimo);
  const hasta = formatParte(maximo);
  if (maximo >= 60 && minimo < 60) {
    return `${desde} - ${hasta}`;
  }
  return minimo === maximo ? desde : `${desde} - ${hasta}`;
};

function TurnoConfirmado() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [turno, setTurno] = useState(() => location.state?.turno || null);
  const [loading, setLoading] = useState(!location.state?.turno);
  const [cancelando, setCancelando] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuscrito, setNotifSuscrito] = useState(false);

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

  useEffect(() => {
    if (!turno || !pushSoportado()) return;
    
    const yaSuscrito = localStorage.getItem(`push_cliente_${turno.codigo_confirmacion}`);
    if (yaSuscrito) {
      setNotifSuscrito(true);
    }
  }, [turno]);

  const handleSuscribirNotificaciones = async () => {
    if (!turno || notifSuscrito) return;
    
    setNotifLoading(true);
    try {
      const success = await suscribirseAPushCliente(
        turno.codigo_confirmacion,
        turno.id_barberia,
        turno.id_turno
      );
      
      if (success) {
        setNotifSuscrito(true);
        localStorage.setItem(`push_cliente_${turno.codigo_confirmacion}`, 'true');
      }
    } catch (err) {
      console.error('Error suscribiendo a push:', err);
    }
    setNotifLoading(false);
  };

  const handleCancelar = async () => {
    if (!await confirmarAccion('Cancelar turno', '¿Estás seguro de cancelar tu turno?')) return;
    
    const barberiaId = location.state?.id_barberia || localStorage.getItem('barberia_actual') || 1;
    setCancelando(true);
    
    try {
      await api.cancelarTurno(barberiaId, turno.id_turno);
      localStorage.removeItem('barberia_actual');
      navigate(`/barberia/${turno.id_barberia}`);
    } catch {
      alertaError('Error al cancelar turno');
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
              <h2>{turno.hora_programada ? formatHora12h(turno.hora_programada) : turno.codigo_confirmacion}</h2>
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
              <p>ESPERA APROXIMADA</p>
              <h2 className="espera-texto">
                {turno.estado === 'en_proceso' ? 'Siendo atendido' :
                 turno.turnos_adelante === 0 ? 'Tu turno es el siguiente' :
                 turno.turnos_adelante > 0 ? (() => {
                   const rango = calcularRangoEspera(turno.turnos_adelante, turno.servicio_duracion);
                   return rango ? formatRangoEspera(rango) : 'Calculando...';
                 })() : null}
              </h2>
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

        {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
          <div className="notif-toggle">
            {notifSuscrito ? (
              <div className="notif-activa">
                <Bell size={18} />
                <span>Notificaciones activadas</span>
              </div>
            ) : (
              <button 
                className="btn-notif"
                onClick={handleSuscribirNotificaciones}
                disabled={notifLoading || !pushSoportado()}
              >
                {notifLoading ? 'Activando...' : <><Bell size={18} /> Activar notificaciones</>}
              </button>
            )}
          </div>
        )}

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
