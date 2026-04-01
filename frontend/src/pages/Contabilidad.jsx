import { useState, useEffect } from 'react';
import { api } from '../api';
import { getAhoraColombia } from '../utils/fecha';
import { DollarSign, TrendingUp, TrendingDown, Scissors, Banknote, ArrowLeft, Calendar } from 'lucide-react';

function Contabilidad({ idBarberia, idBarbero, nombreBarbero }) {
  const [periodo, setPeriodo] = useState('mensual');
  const [diaDetalle, setDiaDetalle] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = getAhoraColombia();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => {
    const now = getAhoraColombia();
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

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
  const getNombreMes = () => {
    const [año, mes] = mesSeleccionado.split('-').map(Number);
    const fecha = new Date(año, mes - 1);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return '';
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
      case 'diario': {
        const [anioDia, mesDia, diaDia] = diaSeleccionado.split('-').map(Number);
        const fechaDia = new Date(anioDia, mesDia - 1, diaDia);
        return `${fechaDia.getDate()} de ${meses[fechaDia.getMonth()]} de ${fechaDia.getFullYear()}`;
      }
      case 'semanal': return 'Últimos 7 días';
      case 'mensual': {
        const [año, mes] = mesSeleccionado.split('-').map(Number);
        const fechaMes = new Date(año, mes - 1);
        return `${meses[fechaMes.getMonth()]} de ${fechaMes.getFullYear()}`;
      }
      default: return periodo;
    }
  };

  const agruparPorDia = (historial) => {
    const dias = {};
    historial.forEach(item => {
      const fechaKey = item.fecha ? item.fecha.split('T')[0] : 
                       item.fecha_cita_original ? item.fecha_cita_original.split('T')[0] :
                       item.fecha_fin_servicio ? item.fecha_fin_servicio.split('T')[0] : null;
      if (!fechaKey) return;
      
      if (!dias[fechaKey]) {
        dias[fechaKey] = { fecha: fechaKey, total: 0, cantidad: 0, turnos: [] };
      }
      dias[fechaKey].total += parseFloat(item.monto) || 0;
      if (item.tipo === 'ingreso') {
        dias[fechaKey].cantidad += 1;
      }
      dias[fechaKey].turnos.push(item);
    });
    return Object.values(dias).sort((a, b) => a.fecha.localeCompare(b.fecha));
  };

  const getDiasSemana = (fechaInicio) => {
    const inicio = new Date(fechaInicio);
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      dias.push(fechaStr);
    }
    return dias;
  };

  // eslint-disable-next-line no-unused-vars
  const getDiasMes = (año, mes) => {
    const ultimoDia = new Date(año, mes, 0);
    const diasMes = [];
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      diasMes.push(`${año}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return diasMes;
  };

  const getInicioSemana = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getDay();
    const diff = date.getDate() - dia + (dia === 0 ? -6 : 1);
    const inicio = new Date(date.setDate(diff));
    return inicio.toISOString().split('T')[0];
  };

  const getNombreDiaSemana = (fechaStr) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fecha = new Date(fechaStr + 'T00:00:00');
    return dias[fecha.getDay()];
  };

  const getNumeroDia = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.getDate();
  };

  const getColorHeatmap = (intensidad, tieneDatos) => {
    if (!tieneDatos) {
      return { bg: '#1a1a1a', text: '#444', border: '#2a2a2a' };
    }
    
    const niveles = [
      { min: 0, max: 0.2, bg: '#0d3d20', text: '#4ade80' },
      { min: 0.2, max: 0.4, bg: '#166534', text: '#4ade80' },
      { min: 0.4, max: 0.6, bg: '#15803d', text: '#86efac' },
      { min: 0.6, max: 0.8, bg: '#22c55e', text: '#14532d' },
      { min: 0.8, max: 1.0, bg: '#4ade80', text: '#14532d' },
    ];
    
    const nivel = niveles.find(n => intensidad >= n.min && intensidad < n.max) || niveles[niveles.length - 1];
    return { bg: nivel.bg, text: nivel.text, border: nivel.bg };
  };

  return (
    <div className="contabilidad-page">
      <div className="header-barbero">
        <div className="header-barbero-top">
          <div className="header-barbero-info">
            <h1>Contabilidad</h1>
            <p>{nombreBarbero}</p>
          </div>
          <div className="user-avatar"><DollarSign size={24} /></div>
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
          <span className="resumen-icon"><Scissors size={20} /></span>
          <span className="resumen-label">Cortes</span>
          <span className="resumen-value">{resumen.cortes || historial.filter(h => h.tipo === 'ingreso').length}</span>
        </div>
        <div className="resumen-card ingresos">
          <span className="resumen-icon"><TrendingUp size={20} color="#22c55e" /></span>
          <span className="resumen-label">Ingresos</span>
          <span className="resumen-value">{formatPeso(resumen.ingresos)}</span>
        </div>
        <div className="resumen-card egresos">
          <span className="resumen-icon"><TrendingDown size={20} color="#ef4444" /></span>
          <span className="resumen-label">Egresos</span>
          <span className="resumen-value">{formatPeso(resumen.egresos)}</span>
        </div>
        <div className="resumen-card balance">
          <span className="resumen-icon"><Banknote size={20} /></span>
          <span className="resumen-label">Balance</span>
          <span className="resumen-value">{formatPeso(resumen.balance)}</span>
        </div>
      </div>

      <div className="historial-section">
        <h3>Historial - {getPeriodoLabel()}</h3>
        
        {loading ? (
          <p className="loading-text">Cargando...</p>
        ) : periodo === 'diario' ? (
          historial.length > 0 ? (
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
          )
        ) : diaDetalle ? (
          <div>
            <button className="btn-volver" onClick={() => setDiaDetalle(null)}>
              <ArrowLeft size={16} /> Volver al mapa
            </button>
            {(() => {
              const turnosDia = historial.filter(item => {
                const fechaItem = item.fecha ? item.fecha.split('T')[0] : 
                                 item.fecha_cita_original ? item.fecha_cita_original.split('T')[0] :
                                 item.fecha_fin_servicio ? item.fecha_fin_servicio.split('T')[0] : null;
                return fechaItem === diaDetalle;
              });
              const totalDia = turnosDia.reduce((sum, t) => sum + (parseFloat(t.monto) || 0), 0);
              const cortesDia = turnosDia.filter(t => t.tipo === 'ingreso').length;
              const [anio, mes, diaNum] = diaDetalle.split('-').map(Number);
              const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
              const fechaObj = new Date(anio, mes - 1, diaNum);
              const nombreDia = diasSemana[fechaObj.getDay()];
              
              return (
                <div className="dia-detalle-header">
                  <div className="dia-detalle-info">
                    <span className="dia-detalle-nombre">{nombreDia} {diaNum} {meses[mes - 1]}</span>
                    <span className="dia-detalle-cortes">{cortesDia} {cortesDia === 1 ? 'corte' : 'cortes'}</span>
                  </div>
                  <div className="dia-detalle-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">{formatPeso(totalDia)}</span>
                  </div>
                </div>
              );
            })()}
            <div className="historial-list">
              {historial.filter(item => {
                const fechaItem = item.fecha ? item.fecha.split('T')[0] : 
                                 item.fecha_cita_original ? item.fecha_cita_original.split('T')[0] :
                                 item.fecha_fin_servicio ? item.fecha_fin_servicio.split('T')[0] : null;
                return fechaItem === diaDetalle;
              }).map((item) => (
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
          </div>
        ) : (
          <div className="mapa-calor">
            {periodo === 'semanal' && (() => {
              const [año, mes, dia] = diaSeleccionado.split('-').map(Number);
              const fechaInicio = getInicioSemana(`${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
              const diasSemana = getDiasSemana(fechaInicio);
              const diasAgrupados = agruparPorDia(historial);
              const maxTotal = Math.max(...diasAgrupados.map(d => d.total), 1);
              const mejorDia = diasAgrupados.reduce((best, d) => d.total > best.total ? d : best, diasAgrupados[0] || { fecha: '', total: 0 });
              
              return (
                <div className="mapa-semana">
                  {diasSemana.map(fecha => {
                    const diaData = diasAgrupados.find(d => d.fecha === fecha);
                    const intensidad = diaData ? diaData.total / maxTotal : 0;
                    const colores = getColorHeatmap(intensidad, !!diaData);
                    const esMejor = mejorDia.fecha === fecha;
                    
                    return (
                      <div 
                        key={fecha} 
                        className={`dia-tarjeta dia-tarjeta-semana ${esMejor ? 'dia-mejor' : ''}`}
                        style={{ 
                          backgroundColor: colores.bg,
                          borderColor: esMejor ? '#fbbf24' : colores.border,
                          color: colores.text
                        }}
                        onClick={() => diaData && setDiaDetalle(fecha)}
                        title={diaData ? `${getNombreDiaSemana(fecha)} ${getNumeroDia(fecha)} — ${diaData.cantidad} ${diaData.cantidad === 1 ? 'corte' : 'cortes'} — ${formatPeso(diaData.total)}` : ''}
                      >
                        <div className="dia-tarjeta-semana-nombre">
                          {getNombreDiaSemana(fecha)} {getNumeroDia(fecha)}
                          {esMejor && <span className="badge-mejor">★</span>}
                        </div>
                        {diaData ? (
                          <div className="dia-tarjeta-semana-cantidad">{diaData.cantidad}</div>
                        ) : (
                          <div className="dia-tarjeta-vacio">-</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            
            {periodo === 'mensual' && (() => {
              const [año, mes] = mesSeleccionado.split('-').map(Number);
              const primerDia = new Date(año, mes - 1, 1);
              const diaSemanaInicio = (primerDia.getDay() + 6) % 7;
              const diasEnMes = new Date(año, mes, 0).getDate();
              
              const diasAgrupados = agruparPorDia(historial);
              const maxTotal = Math.max(...diasAgrupados.map(d => d.total), 1);
              const mejorDia = diasAgrupados.reduce((best, d) => d.total > best.total ? d : best, diasAgrupados[0] || { fecha: '', total: 0 });
              const peorDia = diasAgrupados.reduce((worst, d) => d.total < worst.total && d.total > 0 ? d : worst, diasAgrupados[0] || { fecha: '', total: Infinity });
              
              const getNombreMes = () => {
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return meses[mes - 1];
              };
              
              const totalCeldas = Math.ceil((diaSemanaInicio + diasEnMes) / 7) * 7;
              const diasCalendario = [];
              for (let i = 0; i < totalCeldas; i++) {
                const numDia = i - diaSemanaInicio + 1;
                if (numDia >= 1 && numDia <= diasEnMes) {
                  diasCalendario.push(`${año}-${String(mes).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`);
                } else {
                  diasCalendario.push(null);
                }
              }
              
              return (
                <div className="mapa-mensual">
                  <div className="heatmap-legend">
                    <span className="legend-label">Menor</span>
                    <div className="legend-colors">
                      <span style={{ backgroundColor: '#1a1a1a' }}></span>
                      <span style={{ backgroundColor: '#0d3d20' }}></span>
                      <span style={{ backgroundColor: '#166534' }}></span>
                      <span style={{ backgroundColor: '#15803d' }}></span>
                      <span style={{ backgroundColor: '#22c55e' }}></span>
                      <span style={{ backgroundColor: '#4ade80' }}></span>
                    </div>
                    <span className="legend-label">Mayor</span>
                  </div>
                  {maxTotal > 0 && (
                    <div className="heatmap-mini-stats">
                      <div className="stat-mini mejor">
                        <span className="stat-label">Mejor día</span>
                        <span className="stat-dia">{getNumeroDia(mejorDia.fecha)} {getNombreMes()}</span>
                        <span className="stat-monto">{formatPeso(mejorDia.total)}</span>
                      </div>
                      {peorDia.fecha && peorDia.total !== Infinity && (
                        <div className="stat-mini peor">
                          <span className="stat-label">Peor día</span>
                          <span className="stat-dia">{getNumeroDia(peorDia.fecha)} {getNombreMes()}</span>
                          <span className="stat-monto">{formatPeso(peorDia.total)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="semana-encabezados">
                    <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                  </div>
                  <div className="mapa-mensual-grid">
                    {diasCalendario.map((fecha, i) => {
                      if (!fecha) return <div key={`vacio-${i}`} className="dia-tarjeta dia-vacio"></div>;
                      const diaData = diasAgrupados.find(d => d.fecha === fecha);
                      const intensidad = diaData ? diaData.total / maxTotal : 0;
                      const colores = getColorHeatmap(intensidad, !!diaData);
                      const esMejor = mejorDia.fecha === fecha;
                      const esPeor = peorDia.fecha === fecha;
                      
                      return (
                        <div 
                          key={fecha} 
                          className={`dia-tarjeta ${esMejor ? 'dia-mejor' : ''} ${esPeor ? 'dia-peor' : ''}`}
                          style={{ 
                            backgroundColor: colores.bg,
                            borderColor: esMejor ? '#fbbf24' : esPeor ? '#ef4444' : colores.border,
                            color: colores.text
                          }}
                          onClick={() => diaData && setDiaDetalle(fecha)}
                          title={diaData ? `${getNumeroDia(fecha)} ${getNombreMes()} — ${diaData.cantidad} ${diaData.cantidad === 1 ? 'corte' : 'cortes'} — ${formatPeso(diaData.total)}` : ''}
                        >
                          <div className="dia-tarjeta-header">
                            <span className="dia-numero">{getNumeroDia(fecha)}</span>
                            {esMejor && <span className="badge-mejor">★</span>}
                          </div>
                          {diaData ? (
                            <div className="dia-tarjeta-cortes">{diaData.cantidad}</div>
                          ) : (
                            <div className="dia-tarjeta-vacio">-</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contabilidad;
