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
  console.log('[PUSH] urlBase64ToUint8Array - input length:', base64String.length);
  
  let base64 = base64String
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  console.log('[PUSH] Clave convertida - length:', outputArray.length);
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

    console.log("[PUSH] Esperando service worker...");
    let registration = await navigator.serviceWorker.ready;
    
    if (!registration || !registration.active) {
      console.log("[PUSH] Registrando service worker...");
      const swPath = import.meta.env.DEV ? '/dev-sw.js' : '/sw.js';
      registration = await navigator.serviceWorker.register(swPath, { scope: '/' });
      await navigator.serviceWorker.ready;
    }
    
    if (registration.active && registration.active.state !== 'activated') {
      console.log("[PUSH] Esperando activación...");
      await new Promise((resolve) => {
        registration.active.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') resolve();
        });
        setTimeout(resolve, 2000);
      });
    }
    console.log('[PUSH] Service worker activo y listo');
    console.log("[PUSH] SW:", registration.active?.scriptURL);
    console.log("[PUSH] SW state:", registration.active?.state);

    if (!registration) {
      console.error("[PUSH] No se pudo obtener registration");
      return null;
    }

    console.log("[PUSH] Service Worker activo:", registration.active);
    console.log("[PUSH] Service Worker scope:", registration.scope);
    console.log("[PUSH] Notification permission:", Notification.permission);

    console.log("[PUSH] Obteniendo clave VAPID...");
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      console.error("[PUSH] ERROR: No se pudo obtener la clave VAPID del servidor");
      return null;
    }
    console.log("[PUSH] Clave VAPID recibida del servidor:", publicKey);
    
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    console.log("[PUSH] Clave convertida a Uint8Array - length:", applicationServerKey.length, "bytes");
    console.log("[PUSH] Primeros bytes:", Array.from(applicationServerKey.slice(0, 4)));
    
    if (applicationServerKey.length !== 65) {
      console.error("[PUSH] ERROR: La clave convertida debe tener 65 bytes, tiene:", applicationServerKey.length);
    }
    
    console.log("[PUSH] Suscribiendo al PushManager...");
    console.log("[PUSH] Intentando pushManager.subscribe()...");
    console.log("[PUSH] applicationServerKey length:", applicationServerKey.length);
    console.log("[PUSH] URL del Service Worker:", registration.active?.scriptURL);
    console.log("[PUSH] Origen:", window.location.origin);
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
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
    } catch (subscribeError) {
      console.error("[PUSH] ERROR en pushManager.subscribe():", subscribeError);
      console.error("[PUSH] Nombre del error:", subscribeError.name);
      console.error("[PUSH] Mensaje del error:", subscribeError.message);
      console.error("[PUSH] Causa:", subscribeError.cause);
      
      if (subscribeError.message && subscribeError.message.includes('push service')) {
        console.error("[PUSH] ERROR: El servicio de push no está disponible.");
        console.error("[PUSH] Esto puede ocurrir en desarrollo (localhost). Los navegadores requieren HTTPS para push en producción.");
        console.error("[PUSH] Solución: Usa ngrok o desplega a producción con HTTPS");
      }
      
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
