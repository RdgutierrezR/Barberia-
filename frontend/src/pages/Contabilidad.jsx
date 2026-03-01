import { useState, useEffect } from 'react';
import { api } from '../api';

function Contabilidad({ idBarberia, idBarbero, nombreBarbero }) {
  const [periodo, setPeriodo] = useState('mensual');
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, balance: 0, cortes: 0 });
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [idBarberia, idBarbero, periodo, mesSeleccionado, diaSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      let fechaInicio, fechaFin;
      const [año, mes] = mesSeleccionado.split('-').map(Number);
      
      if (periodo === 'diario') {
        fechaInicio = diaSeleccionado;
        fechaFin = diaSeleccionado;
      } else if (periodo === 'semanal') {
        const hoy = new Date();
        const hace7 = new Date(hoy);
        hace7.setDate(hoy.getDate() - 7);
        fechaInicio = `${hace7.getFullYear()}-${String(hace7.getMonth() + 1).padStart(2, '0')}-${String(hace7.getDate()).padStart(2, '0')}`;
        fechaFin = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      } else {
        const primerDia = new Date(año, mes - 1, 1);
        const ultimoDia = new Date(año, mes, 0);
        fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`;
        fechaFin = `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
      }

      const data = await api.getResumenContabilidad(
        idBarberia, 
        idBarbero, 
        periodo,
        fechaInicio,
        fechaFin
      );
      setResumen(data);
      
      const hist = await api.getContabilidad(
        idBarberia, 
        idBarbero, 
        fechaInicio,
        fechaFin
      );
      setHistorial(hist);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion) => {
    const [año, mes] = mesSeleccionado.split('-').map(Number);
    let nuevoMes = mes + direccion;
    let nuevoAño = año;
    
    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }
    
    setMesSeleccionado(`${nuevoAño}-${String(nuevoMes).padStart(2, '0')}`);
  };

  const getNombreMes = () => {
    const [año, mes] = mesSeleccionado.split('-').map(Number);
    const fecha = new Date(año, mes - 1);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    let hora = fecha.getHours();
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}, ${hora}:${minuto} ${ampm}`;
  };

  const formatPeso = (monto) => {
    const num = parseFloat(monto) || 0;
    return num.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('COP', '$').trim();
  };

  const getPeriodoLabel = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    switch (periodo) {
      case 'diario': 
        const fechaDia = new Date(diaSeleccionado);
        return `${fechaDia.getDate()} de ${meses[fechaDia.getMonth()]} de ${fechaDia.getFullYear()}`;
      case 'semanal': return 'Últimos 7 días';
      case 'mensual': 
        const [año, mes] = mesSeleccionado.split('-').map(Number);
        const fechaMes = new Date(año, mes - 1);
        return `${meses[fechaMes.getMonth()]} de ${fechaMes.getFullYear()}`;
      default: return periodo;
    }
  };

  return (
    <div className="contabilidad-page">
      <div className="header-barbero">
        <div className="header-barbero-top">
          <div className="header-barbero-info">
            <h1>Contabilidad</h1>
            <p>{nombreBarbero}</p>
          </div>
          <div className="user-avatar">💰</div>
        </div>
      </div>

      <div className="periodo-selector">
        <button 
          className={`periodo-btn ${periodo === 'diario' ? 'active' : ''}`}
          onClick={() => setPeriodo('diario')}
        >
          Día
        </button>
        <button 
          className={`periodo-btn ${periodo === 'semanal' ? 'active' : ''}`}
          onClick={() => setPeriodo('semanal')}
        >
          Semana
        </button>
        <button 
          className={`periodo-btn ${periodo === 'mensual' ? 'active' : ''}`}
          onClick={() => setPeriodo('mensual')}
        >
          Mes
        </button>
      </div>

      {periodo === 'diario' && (
        <div className="dia-selector">
          <label>Seleccionar fecha:</label>
          <input 
            type="date" 
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="date-input"
          />
        </div>
      )}

      {periodo === 'semanal' && (
        <div className="dia-selector">
          <label>Ver semana específica:</label>
          <input 
            type="date" 
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="date-input"
          />
        </div>
      )}

      {periodo === 'mensual' && (
        <div className="dia-selector">
          <label>Seleccionar mes:</label>
          <input 
            type="month" 
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="date-input"
          />
        </div>
      )}

      <div className="resumen-cards">
        <div className="resumen-card">
          <span className="resumen-icon">✂️</span>
          <span className="resumen-label">Cortes</span>
          <span className="resumen-value">{resumen.cortes || historial.filter(h => h.tipo === 'ingreso').length}</span>
        </div>
        <div className="resumen-card ingresos">
          <span className="resumen-icon">📈</span>
          <span className="resumen-label">Ingresos</span>
          <span className="resumen-value">{formatPeso(resumen.ingresos)}</span>
        </div>
        <div className="resumen-card egresos">
          <span className="resumen-icon">📉</span>
          <span className="resumen-label">Egresos</span>
          <span className="resumen-value">{formatPeso(resumen.egresos)}</span>
        </div>
        <div className="resumen-card balance">
          <span className="resumen-icon">💵</span>
          <span className="resumen-label">Balance</span>
          <span className="resumen-value">{formatPeso(resumen.balance)}</span>
        </div>
      </div>

      <div className="historial-section">
        <h3>Historial - {getPeriodoLabel()}</h3>
        {loading ? (
          <p className="loading-text">Cargando...</p>
        ) : historial.length > 0 ? (
          <div className="historial-list">
            {historial.map((item) => (
              <div key={item.id_registro} className={`historial-item ${item.tipo}`}>
                <div className="historial-info">
                  <span className="historial-desc">{item.cliente_nombre || item.descripcion || 'Corte'}</span>
                  <span className="historial-servicio">{item.servicio_nombre}</span>
                  <span className="historial-fecha">
                    {item.fecha_fin_servicio ? formatFecha(item.fecha_fin_servicio) : 
                     item.fecha_cita_original ? `Cita: ${formatFecha(item.fecha_cita_original)}` :
                     formatFecha(item.fecha)}
                  </span>
                </div>
                <span className={`historial-monto ${item.tipo}`}>
                  {item.tipo === 'ingreso' ? '+' : '-'}{formatPeso(item.monto)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">No hay registros en este período</p>
        )}
      </div>
    </div>
  );
}

export default Contabilidad;
