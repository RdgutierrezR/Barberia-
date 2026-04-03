import { API_URL } from '../config';

let vapidPublicKey = null;

export const getVapidPublicKey = async () => {
  if (vapidPublicKey) return vapidPublicKey;
  
  try {
    console.log('[PUSH] Obteniendo clave VAPID de:', `${API_URL}/push/public-key`);
    const res = await fetch(`${API_URL}/push/public-key`);
    const data = await res.json();
    console.log('[PUSH] Clave VAPID obtenida:', data.publicKey ? 'OK' : 'VACIA');
    console.log("[PUSH] Data completa:", data);
    vapidPublicKey = data.publicKey;
    console.log("[PUSH] Public key:", vapidPublicKey);
    return vapidPublicKey;
  } catch (e) {
    console.error('[PUSH] Error obteniendo VAPID key:', e);
    return null;
  }
};

export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

export const pushSoportado = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const solicitarPermisoPush = async () => {
  if (!pushSoportado()) {
    console.log('[PUSH] Push no soportado');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('[PUSH] Permiso denegado');
    return null;
  }

  return permission;
};

export const suscribirseAPush = async (token) => {
  console.log("[PUSH] ========== INICIANDO SUSCRIPCION ==========");
  
  if (!pushSoportado()) {
    console.log("[PUSH] Push no soportado en este navegador");
    return null;
  }
  console.log("[PUSH] Push soportado");

  try {
    console.log("[PUSH] Verificando Notification.permission...");
    let permission = Notification.permission;
    console.log("[PUSH] Permission actual:", permission);

    if (permission === 'default') {
      console.log("[PUSH] Solicitando permiso...");
      permission = await Notification.requestPermission();
      console.log("[PUSH] Permission solicitado:", permission);
    }

    if (permission !== 'granted') {
      console.log("[PUSH] Permiso denegado o no otorgado:", permission);
      return null;
    }
    console.log("[PUSH] Permiso garantizado");

    console.log("[PUSH] Obteniendo service worker listo...");
    let registration;
    try {
      registration = await navigator.serviceWorker.ready;
      console.log("[PUSH] Service worker listo:", registration.active?.scriptURL || 'sin URL');
    } catch (swError) {
      console.log("[PUSH] SW.ready falló, intentando registrar:", swError.message);
      registration = await navigator.serviceWorker.register('/sw.js');
      console.log("[PUSH] SW registrado manualmente:", registration);
    }

    if (!registration) {
      console.error("[PUSH] No se pudo obtener registration");
      return null;
    }

    console.log("[PUSH] Service Worker activo:", registration.active);
    console.log("[PUSH] Service Worker state:", registration.active?.state);
    console.log("[PUSH] Service Worker scope:", registration.scope);
    console.log("[PUSH] Notification permission:", Notification.permission);

    await navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => {
        console.log("[PUSH] Actualizando SW:", reg.scope);
        reg.update();
      });
    });

    console.log("[PUSH] Obteniendo clave VAPID...");
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      console.error("[PUSH] No se pudo obtener la clave VAPID");
      return null;
    }
    console.log("[PUSH] Clave VAPID obtenida");
    console.log("[PUSH] Clave VAPID:", publicKey);
    console.log("[PUSH] Convirtiendo clave VAPID...");
    console.log("[PUSH] Intentando subscribe...");

    console.log("[PUSH] Suscribiendo al PushManager...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log("[PUSH] Subscription:", subscription);

    console.log("[PUSH] Suscripción creada exitosamente");
    console.log("[PUSH] Endpoint:", subscription.endpoint);
    console.log("[PUSH] Keys:", subscription.toJSON().keys);

    console.log("[PUSH] Enviando suscripción al backend...");
    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    const result = await res.json();
    console.log("[PUSH] Respuesta del backend:", res.status, result);

    if (res.ok) {
      console.log("[PUSH] ✓ Suscripción guardada en backend");
      return subscription;
    } else {
      console.error("[PUSH] Error guardando suscripción:", result);
      return null;
    }
  } catch (e) {
    console.error("[PUSH] Error en suscripción:", e);
    return null;
  }
};

export const cancelarSuscripcionPush = async (token) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      await fetch(`${API_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    }
  } catch (e) {
    console.error('[PUSH] Error cancelando suscripción:', e);
  }
};
