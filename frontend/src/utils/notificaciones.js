export const NOTIFICATION_PERMISSION_KEY = 'notificacion_permiso';

export const notificacionesSoportadas = () => {
  if (!('Notification' in window)) return false;
  return true;
};

export const solicitarPermisoNotificaciones = async () => {
  if (!notificacionesSoportadas()) {
    console.log('[NOTIF] Notificaciones no soportadas');
    return false;
  }

  console.log('[NOTIF] Permission actual:', Notification.permission);

  if (Notification.permission === 'granted') {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
    console.log('[NOTIF] Ya tenía permiso granted');
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, granted ? 'granted' : 'denied');
    console.log('[NOTIF] Permiso solicitado, resultado:', permission);
    return granted;
  }

  console.log('[NOTIF] Permiso denegado o ya denegado');
  return false;
};

export const tienePermisoNotificaciones = () => {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'granted' && notificacionesSoportadas();
};

export const mostrarNotificacion = (titulo, opciones = {}) => {
  if (!tienePermisoNotificaciones()) return null;

  const defaults = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'barber-app-notification',
    renotify: true,
    data: { url: '/' }
  };

  const config = { ...defaults, ...opciones };

  try {
    const notification = new Notification(titulo, config);
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      if (config.data?.url) {
        window.location.href = config.data.url;
      }
    };
    return notification;
  } catch (error) {
    console.error('Error mostrando notificación:', error);
    return null;
  }
};

export const notificarNuevoTurno = (nombreCliente, servicio) => {
  return mostrarNotificacion('Nuevo Turno!', {
    body: `${nombreCliente} - ${servicio}`,
    tag: 'nuevo-turno',
    requireInteraction: false
  });
};
