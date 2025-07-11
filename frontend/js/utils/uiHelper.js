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
    window.Swal.fire({
      title: title,
      text: message,
      icon: icon,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: "var(--surface)",
      color: "var(--text-color)",
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", window.Swal.stopTimer)
        toast.addEventListener("mouseleave", window.Swal.resumeTimer)
      },
    })
  },

  /**
   * Muestra un cuadro de diálogo de confirmación usando SweetAlert2.
   * @param {string} title - Título de la confirmación.
   * @param {string} text - Texto del cuerpo.
   * @param {'warning'|'question'} icon - Icono de la confirmación.
   * @returns {Promise<boolean>} Resuelve a true si el usuario confirma, false si cancela.
   */
  showConfirmation: async (title, text, icon = "warning") => {
    const result = await window.Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      background: "var(--surface)",
      color: "var(--text-color)",
      customClass: {
        popup: "swal-custom-popup",
      },
    })
    return result.isConfirmed
  },

  /**
   * Habilita/deshabilita un elemento.
   * @param {HTMLElement} element - El elemento del DOM.
   * @param {boolean} enable - True para habilitar, false para deshabilitar.
   */
  setElementEnabled: (element, enable) => {
    if (element) {
      element.disabled = !enable
      if (enable) {
        element.style.opacity = "1"
        element.style.cursor = "pointer"
      } else {
        element.style.opacity = "0.6"
        element.style.cursor = "not-allowed"
      }
    }
  },

  /**
   * Muestra u oculta un indicador de carga.
   * @param {HTMLElement} loadingElement - El elemento de carga.
   * @param {boolean} show - True para mostrar, false para ocultar.
   */
  toggleLoadingIndicator: (loadingElement, show) => {
    if (loadingElement) {
      loadingElement.style.display = show ? "block" : "none"
    }
  },

  /**
   * Formatea una fecha para mostrar
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate: (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Fecha inválida"
    }
  },
}
