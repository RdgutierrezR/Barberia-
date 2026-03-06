import { useState, useEffect } from 'react';
import { api } from '../api';

function Metricas({ id_barberia, id_barbero, nombreBarbero }) {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('diario');

  useEffect(() => {
    cargarMetricas();
  }, [periodo]);

  const cargarMetricas = async () => {
    setLoading(true);
    try {
      let fi, ff;
      const hoy = new Date();
      const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const getFechaLocal = (date) => {
        const año = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      };
      
      if (periodo === 'diario') {
        fi = getFechaLocal(hoy);
        ff = fi;
      } else if (periodo === 'semanal') {
        const hace7 = new Date(hoy);
        hace7.setDate(hoy.getDate() - 7);
        fi = getFechaLocal(hace7);
        ff = getFechaLocal(hoy);
      } else {
        const hace30 = new Date(hoy);
        hace30.setDate(hoy.getDate() - 30);
        fi = getFechaLocal(hace30);
        ff = getFechaLocal(hoy);
      }
      
      const data = await api.getMetricasOperacionales(id_barberia, id_barbero, fi, ff);
      setMetricas(data);
    } catch (err) {
      console.error('Error cargando métricas:', err);
    }
    setLoading(false);
  };

  const formatMinutos = (minutos) => {
    if (!minutos && minutos !== 0) return '-';
    const num = parseInt(minutos);
    if (isNaN(num)) return '-';
    if (num === 0) return '0m';
    const horas = Math.floor(num / 60);
    const mins = num % 60;
    if (horas > 0) {
      return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    }
    return `${mins}m`;
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
  };

  const getColorOcupacion = (porcentaje) => {
    if (porcentaje >= 80) return '#f59e0b';
    if (porcentaje >= 50) return '#d97706';
    return '#7f1d1d';
  };

  return (
    <div className="metricas-page">
      <div className="header-barbero">
        <div className="header-barbero-top">
          <div className="header-barbero-info">
            <h1>Métricas</h1>
            <p>{nombreBarbero}</p>
          </div>
          <div className="user-avatar">📊</div>
        </div>
      </div>

      <div className="metricas-periodo">
        <button 
          className={`periodo-btn ${periodo === 'diario' ? 'active' : ''}`}
          onClick={() => setPeriodo('diario')}
        >
          Hoy
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

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : metricas ? (
        <div className="metricas-content">
          <div className="metricas-resumen">
            <div className="metrica-card">
              <span className="metrica-icon">✅</span>
              <span className="metrica-value">{metricas.total_completados}</span>
              <span className="metrica-label">Completados</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-icon">❌</span>
              <span className="metrica-value">{metricas.total_cancelados}</span>
              <span className="metrica-label">Cancelados</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-icon">📉</span>
              <span className="metrica-value">{metricas.tasa_cancelacion}%</span>
              <span className="metrica-label">Tasa Cancel.</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-icon">⏱️</span>
              <span className="metrica-value">{formatMinutos(metricas.tiempo_promedio)}</span>
              <span className="metrica-label">Promedio</span>
            </div>
          </div>

          <div className="metricas-destaque">
            <div className="ocupacion-circulo">
              <svg viewBox="0 0 36 36" className="circulo-ocupacion">
                <path
                  className="circulo-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circulo-progreso"
                  stroke={getColorOcupacion(metricas.porcentaje_ocupacion)}
                  strokeDasharray={`${Math.min(metricas.porcentaje_ocupacion, 100)}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="ocupacion-texto">
                <span className="ocupacion-pct" style={{ color: getColorOcupacion(metricas.porcentaje_ocupacion) }}>
                  {metricas.porcentaje_ocupacion}%
                </span>
                <span className="ocupacion-label">Ocupación</span>
              </div>
            </div>
            <div className="ocupacion-detalles">
              <div className="ocupacion-fila">
                <span>📅 Tiempo trabajado</span>
                <span className="valor">{formatMinutos(metricas.tiempo_total_minutos)}</span>
              </div>
              <div className="ocupacion-fila">
                <span>🕐 Tiempo disponible</span>
                <span className="valor">{formatMinutos(metricas.tiempo_disponible_minutos)}</span>
              </div>
              <div className="ocupacion-fila">
                <span>📋 Total turnos</span>
                <span className="valor">{metricas.total_turnos}</span>
              </div>
            </div>
          </div>

          {metricas.servicios_detalle && metricas.servicios_detalle.length > 0 && (
            <div className="metricas-seccion">
              <h3>Por Servicio</h3>
              <div className="servicios-grid">
                {metricas.servicios_detalle.map((servicio, idx) => (
                  <div key={idx} className="servicio-chip">
                    <span className="servicio-nombre">{servicio.servicio}</span>
                    <span className="servicio-cantidad">{servicio.cantidad}</span>
                    <span className="servicio-duracion">{formatMinutos(servicio.duracion_promedio)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metricas.ocupacion_diaria && metricas.ocupacion_diaria.length > 1 && (
            <div className="metricas-seccion">
              <h3>Ocupación por Día</h3>
              <div className="ocupacion-bars">
                {metricas.ocupacion_diaria.map((dia, idx) => (
                  <div key={idx} className="ocupacion-bar-item">
                    <span className="bar-fecha">{formatFecha(dia.fecha)}</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${Math.min(dia.ocupacion_porcentaje, 100)}%`,
                          backgroundColor: getColorOcupacion(Math.min(dia.ocupacion_porcentaje, 100))
                        }}
                      ></div>
                    </div>
                    <span className="bar-pct" style={{ color: getColorOcupacion(Math.min(dia.ocupacion_porcentaje, 100)) }}>
                      {Math.min(dia.ocupacion_porcentaje, 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!metricas.total_turnos || metricas.total_turnos === 0) && (
            <div className="no-data">
              <p>No hay datos para el período seleccionado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <p>Error al cargar métricas</p>
        </div>
      )}
    </div>
  );
}

export default Metricas;
