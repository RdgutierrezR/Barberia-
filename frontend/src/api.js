const API_URL = 'http://192.168.1.86:5000/api';

const getToken = () => localStorage.getItem('barbero_token');

const headers = () => {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

export const api = {
  getBarberias: async () => {
    const res = await fetch(`${API_URL}/barberias`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  },
  
  getBarberia: async (id) => {
    const res = await fetch(`${API_URL}/barberias/${id}`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  },
  
  getBarberos: async (idBarberia) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/barberos`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },
  
  getServicios: async (idBarberia) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/servicios`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },
  
  crearTurnoCola: async (idBarberia, data) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/turnos/cola`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || `Error: ${res.status}`);
    return result;
  },
  
  getTurnoPorCodigo: async (idBarberia, codigo) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/turnos/codigo/${codigo}`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  },
  
  getColaBarbero: async (idBarberia, idBarbero) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/turnos/cola/${idBarbero}`, {
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },
  
  pasarSiguiente: async (idBarberia, idBarbero) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/turnos/cola/${idBarbero}/siguiente`, {
      method: 'PUT',
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },
  
  cancelarTurno: async (idBarberia, idTurno) => {
    const res = await fetch(`${API_URL}/barberias/${idBarberia}/turnos/${idTurno}/cancelar`, {
      method: 'PUT',
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },

  loginBarbero: async (correo, contrasena, idBarberia) => {
    const res = await fetch(`${API_URL}/auth/barbero/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena, id_barberia: idBarberia })
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  },

  registroBarbero: async (data) => {
    const res = await fetch(`${API_URL}/auth/barbero/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  },

  getResumenContabilidad: async (idBarberia, idBarbero, periodo, fechaInicio, fechaFin) => {
    let url = `${API_URL}/barberias/${idBarberia}/contabilidad/barbero/${idBarbero}/resumen?periodo=${periodo}`;
    if (fechaInicio && fechaFin) {
      url += `&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }
    const res = await fetch(url, { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  },

  getContabilidad: async (idBarberia, idBarbero, fechaInicio, fechaFin) => {
    let url = `${API_URL}/barberias/${idBarberia}/contabilidad/barbero/${idBarbero}`;
    const params = [];
    if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
    if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url, { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  }
};
