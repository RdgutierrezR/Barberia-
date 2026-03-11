const TIMEZONE = 'America/Bogota';

export const getFechaLocal = () => {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const getFechaHoraLocal = () => {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const hora = String(now.getHours()).padStart(2, '0');
  const minuto = String(now.getMinutes()).padStart(2, '0');
  return `${anio}-${mes}-${dia} ${hora}:${minuto}`;
};

export const getAhoraColombia = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
};

export const formatFechaInput = (fecha) => {
  if (!fecha) return '';
  if (typeof fecha === 'string' && fecha.includes('T')) {
    fecha = new Date(fecha);
  }
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const formatHora12h = (hora24) => {
  if (!hora24) return '';
  const [hora, minuto] = hora24.split(':');
  let h = parseInt(hora, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${minuto} ${ampm}`;
};

export const formatFechaMostrar = (fechaStr) => {
  if (!fechaStr) return '';
  let fecha;
  if (typeof fechaStr === 'string') {
    if (fechaStr.includes('T')) {
      fecha = new Date(fechaStr);
    } else {
      const [anio, mes, dia] = fechaStr.split('-').map(Number);
      fecha = new Date(anio, mes - 1, dia);
    }
  } else {
    fecha = fechaStr;
  }
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
};

export const getFechaColombia = () => {
  return getAhoraColombia();
};

export const parsearFecha = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  
  let fecha, hora;
  if (fechaStr.includes('T')) {
    [fecha, hora] = fechaStr.split('T');
  } else {
    [fecha, hora] = fechaStr.split(' ');
  }
  
  if (!fecha) return null;
  
  const [anio, mes, dia] = fecha.split('-').map(Number);
  if (hora) {
    const horaLimpia = hora.split('.')[0];
    const [horaNum, minuto] = horaLimpia.split(':');
    return new Date(anio, mes - 1, dia, horaNum, minuto);
  }
  return new Date(anio, mes - 1, dia);
};

export const formatearFechaHora = (fechaStr) => {
  const fecha = parsearFecha(fechaStr);
  if (!fecha) return '';
  let h = fecha.getHours();
  const min = String(fecha.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${min} ${ampm}`;
};

export const formatFechaColombia = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  const opciones = {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const [mes, dia, anio] = fecha.toLocaleDateString('es-CO', opciones).split('/');
  return `${anio}-${mes}-${dia}`;
};

export const getHoraColombia = () => {
  const ahora = getAhoraColombia();
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minuto = String(ahora.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
};
