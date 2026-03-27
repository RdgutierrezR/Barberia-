import { useState, useEffect, useRef } from 'react';

export function useAuthInit() {
  const [inicializado, setInicializado] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const abortControllersRef = useRef([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const verificarToken = () => {
      const token = localStorage.getItem('barbero_token');
      if (token) {
        setTokenValido(true);
      } else {
        setTokenValido(false);
      }
      setInicializado(true);
    };

    setTimeout(verificarToken, 0);

    const controllers = abortControllersRef.current;
    return () => {
      mountedRef.current = false;
      controllers.forEach(controller => {
        try {
          controller.abort();
        } catch {/* empty */}
      });
    };
  }, []);

  const crearAbortController = () => {
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    return controller;
  };

  return { inicializado, tokenValido, crearAbortController, mountedRef };
}
