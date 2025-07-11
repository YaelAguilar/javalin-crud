// frontend/js/utils/uiHelper.js

/**
 * @namespace UiHelper
 * @description Contiene funciones de utilidad para interacciones con la interfaz de usuario.
 */
export const UiHelper = {

    /**
     * Muestra una notificación usando SweetAlert2.
     * @param {string} title - Título de la notificación.
     * @param {string} message - Mensaje detallado.
     * @param {'success'|'error'|'warning'|'info'|'question'} icon - Icono de la notificación.
     */
    showNotification: (title, message, icon) => {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    },

    /**
     * Muestra un cuadro de diálogo de confirmación usando SweetAlert2.
     * @param {string} title - Título de la confirmación (ej. "¿Estás seguro?").
     * @param {string} text - Texto del cuerpo (ej. "Esta acción no se puede deshacer").
     * @param {'warning'|'question'} icon - Icono de la confirmación.
     * @returns {Promise<boolean>} Resuelve a true si el usuario confirma, false si cancela.
     */
    showConfirmation: async (title, text, icon = 'warning') => {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed;
    },

    /**
     * Habilita/deshabilita un botón o campo de entrada.
     * @param {HTMLElement} element - El elemento del DOM.
     * @param {boolean} enable - True para habilitar, false para deshabilitar.
     */
    setElementEnabled: (element, enable) => {
        if (element) {
            element.disabled = !enable;
            element.style.opacity = enable ? '1' : '0.6';
            element.style.cursor = enable ? 'pointer' : 'not-allowed';
        }
    },

    /**
     * Muestra u oculta un elemento de carga.
     * @param {HTMLElement} loadingElement - El elemento de carga (ej. un párrafo "Cargando...").
     * @param {boolean} show - True para mostrar, false para ocultar.
     */
    toggleLoadingIndicator: (loadingElement, show) => {
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
};