import { API_URL } from '../config';

let vapidPublicKey = null;

export const getVapidPublicKey = async () => {
  if (vapidPublicKey) return vapidPublicKey;
  
  try {
    console.log('[PUSH] Obteniendo clave VAPID de:', `${API_URL}/push/public-key`);
    const res = await fetch(`${API_URL}/push/public-key`);
    const data = await res.json();
    console.log('[PUSH] Clave VAPID obtenida:', data.public_key ? 'OK' : 'VACIA');
    vapidPublicKey = data.public_key;
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
  if (!pushSoportado()) {
    console.log('[PUSH] Push no soportado');
    return null;
  }

  try {
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      console.error('[PUSH] No se pudo obtener la clave VAPID');
      return null;
    }

    let registration;
    try {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('[PUSH] Registrando service worker...');
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PUSH] SW registrado:', registration);
      }
    } catch (swError) {
      console.error('[PUSH] Error con SW:', swError);
      registration = await navigator.serviceWorker.register('/sw.js');
    }
    
    if (!registration) {
      console.error('[PUSH] No se pudo obtener registration');
      return null;
    }
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log('[PUSH] Suscripción creada:', subscription);

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

    if (res.ok) {
      console.log('[PUSH] Suscripción guardada en backend');
      return subscription;
    } else {
      console.error('[PUSH] Error guardando suscripción:', await res.text());
      return null;
    }
  } catch (e) {
    console.error('[PUSH] Error en suscripción:', e);
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
