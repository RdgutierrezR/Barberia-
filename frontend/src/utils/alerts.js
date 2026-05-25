import Swal from 'sweetalert2';

const config = {
  background: '#1a1a2e',
  color: '#e0e0e0',
  confirmButtonColor: '#2F4F6F',
  cancelButtonColor: '#555',
  denyButtonColor: '#e74c3c',
  reverseButtons: true,
  customClass: {
    popup: 'swal-dark',
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel'
  }
};

export const alertaExito = (mensaje) => {
  Swal.fire({
    ...config,
    icon: 'success',
    title: 'Éxito',
    text: mensaje,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
};

export const alertaError = (mensaje) => {
  Swal.fire({
    ...config,
    icon: 'error',
    title: 'Error',
    text: mensaje,
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar'
  });
};

export const confirmarAccion = async (titulo, texto, opciones = {}) => {
  const result = await Swal.fire({
    ...config,
    icon: 'question',
    title: titulo || '¿Estás seguro?',
    text: texto || 'Esta acción no se puede deshacer',
    showCancelButton: true,
    confirmButtonText: opciones.confirmarTexto || 'Sí, continuar',
    cancelButtonText: opciones.cancelarTexto || 'Cancelar',
    confirmButtonColor: opciones.confirmarColor || config.confirmButtonColor,
    focusCancel: true
  });
  return result.isConfirmed;
};

export const alertaInfo = (mensaje) => {
  Swal.fire({
    ...config,
    icon: 'info',
    title: 'Información',
    text: mensaje,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
};
