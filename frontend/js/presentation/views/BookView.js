// frontend/js/presentation/views/BookView.js

import { UiHelper } from '../../utils/uiHelper.js'; // Para mostrar notificaciones y confirmaciones
import { BookCard } from '../components/BookCard.js'; // Para renderizar tarjetas de libros
import { BookViewModel } from '../viewmodels/BookViewModel.js'; // Necesitamos el ViewModel

/**
 * @class BookView
 * @description La "View" en el patrón MVVM. Gestiona la interfaz de usuario,
 * escucha eventos del usuario y observa cambios en el ViewModel para actualizar el DOM.
 */
export class BookView {
    /**
     * @param {BookViewModel} bookViewModel - Instancia del ViewModel de libros.
     */
    constructor(bookViewModel) {
        if (!bookViewModel || !(bookViewModel instanceof BookViewModel)) {
            throw new Error('BookView: Se requiere una instancia válida de BookViewModel.');
        }
        this.bookViewModel = bookViewModel;

        // Referencias a elementos del DOM
        this.bookForm = document.getElementById('book-form');
        this.bookIdInput = document.getElementById('book-id');
        this.titleInput = document.getElementById('title');
        this.authorInput = document.getElementById('author');
        this.publicationYearInput = document.getElementById('publicationYear');
        this.isbnInput = document.getElementById('isbn');
        this.submitButton = document.getElementById('submit-button');
        this.cancelButton = document.getElementById('cancel-button');
        this.formTitle = document.getElementById('form-title');
        this.bookListDiv = document.getElementById('book-list');
        this.loadingMessageElement = this.bookListDiv.querySelector('.loading-message');

        // Suscribir la vista a los cambios del ViewModel
        this.bookViewModel.onBooksChanged = this.renderBooks.bind(this);
        this.bookViewModel.onBookSelected = this.fillFormForEdit.bind(this);
        this.bookViewModel.onError = this.handleViewModelError.bind(this);
        this.bookViewModel.onLoadingChanged = this.handleLoadingState.bind(this);

        // Configurar event listeners
        this.bookForm.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelButton.addEventListener('click', this.handleCancelEdit.bind(this));

        // Inicializar la vista
        this.resetForm();
    }

    /**
     * Resetea el formulario a su estado inicial (modo "añadir nuevo libro").
     */
    resetForm() {
        this.bookForm.reset();
        this.bookIdInput.value = '';
        this.submitButton.innerHTML = '<i class="fas fa-save"></i> Añadir Libro';
        this.formTitle.textContent = 'Añadir Nuevo Libro';
        this.cancelButton.style.display = 'none';
        this.isbnInput.disabled = false; // Habilitar ISBN para añadir
        this.bookViewModel.resetCurrentBook(); // Notificar al ViewModel que ya no hay libro en edición
    }

    /**
     * Rellena el formulario con los datos de un libro para edición.
     * @param {Book} book - El libro a cargar en el formulario.
     */
    fillFormForEdit(book) {
        if (book) {
            this.bookIdInput.value = book.id;
            this.titleInput.value = book.title;
            this.authorInput.value = book.author;
            this.publicationYearInput.value = book.publicationYear;
            this.isbnInput.value = book.isbn;
            this.isbnInput.disabled = true; // El ISBN no debe ser editable en PUT si es clave única

            this.submitButton.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Libro';
            this.formTitle.textContent = `Editar Libro (ID: ${book.id})`;
            this.cancelButton.style.display = 'inline-block';
        } else {
            this.resetForm(); // Si book es null, resetear el formulario
        }
    }

    /**
     * Renderiza la lista de libros en el DOM.
     * @param {Book[]} books - La lista de libros a mostrar.
     */
    renderBooks(books) {
        this.bookListDiv.innerHTML = ''; // Limpiar la lista
        if (books.length > 0) {
            books.forEach(book => {
                const bookCard = new BookCard(book, 
                    (id) => this.bookViewModel.selectBookForEdit(id), // Pasar callback para edición
                    async (id) => {
                        try {
                            await this.bookViewModel.deleteBook(id);
                            UiHelper.showNotification('Éxito', 'Libro eliminado con éxito.', 'success');
                        } catch (error) {
                            UiHelper.showNotification('Error', error.message || 'Error al eliminar el libro.', 'error');
                        }
                    } // Pasar callback para eliminación
                );
                this.bookListDiv.appendChild(bookCard.getElement());
            });
        } else {
            this.bookListDiv.innerHTML = '<p class="loading-message">No hay libros en la base de datos.</p>';
        }
    }

    /**
     * Maneja el envío del formulario (Crear o Actualizar).
     * @param {Event} event - El evento de envío del formulario.
     */
    async handleSubmit(event) {
        event.preventDefault(); // Evitar recarga de la página

        const id = bookIdInput.value ? parseInt(bookIdInput.value, 10) : null;
        const title = titleInput.value;
        const author = authorInput.value;
        const publicationYear = parseInt(publicationYearInput.value, 10);
        const isbn = isbnInput.value;

        // Validaciones básicas de la vista (adicionales a las del servicio)
        if (!title || !author || !publicationYear || !isbn) {
            UiHelper.showNotification('Advertencia', 'Todos los campos son obligatorios.', 'warning');
            return;
        }
        if (isNaN(publicationYear) || publicationYear <= 0) {
            UiHelper.showNotification('Advertencia', 'Año de publicación debe ser un número positivo.', 'warning');
            return;
        }

        const bookData = { id, title, author, publicationYear, isbn };

        try {
            await this.bookViewModel.saveBook(bookData);
            // Si el save fue exitoso, el ViewModel recargará los libros y la View los renderizará.
            // Aquí solo mostramos la notificación y reseteamos el formulario.
            UiHelper.showNotification('Éxito', id ? 'Libro actualizado con éxito.' : 'Libro añadido con éxito.', 'success');
            this.resetForm();
        } catch (error) {
            // El error ya fue manejado por handleViewModelError o es un error de red
            UiHelper.showNotification('Error', error.message || 'Ocurrió un error inesperado.', 'error');
        }
    }

    /**
     * Maneja el clic en el botón "Cancelar Edición".
     */
    handleCancelEdit() {
        this.resetForm();
    }

    /**
     * Maneja los errores reportados por el ViewModel.
     * @param {Error} error - El objeto de error.
     */
    handleViewModelError(error) {
        if (error) {
            // Solo mostramos la notificación si el error es significativo
            // Los errores de validación de formulario ya son manejados antes
            console.error('Error en ViewModel:', error);
            UiHelper.showNotification('Error de Operación', error.message || 'Ha ocurrido un error.', 'error');
        }
    }

    /**
     * Maneja los cambios en el estado de carga reportados por el ViewModel.
     * @param {boolean} isLoading - True si está cargando, false si no.
     */
    handleLoadingState(isLoading) {
        UiHelper.setElementEnabled(this.submitButton, !isLoading);
        UiHelper.setElementEnabled(this.cancelButton, !isLoading);
        UiHelper.setElementEnabled(this.titleInput, !isLoading);
        UiHelper.setElementEnabled(this.authorInput, !isLoading);
        UiHelper.setElementEnabled(this.publicationYearInput, !isLoading);
        UiHelper.setElementEnabled(this.isbnInput, !isLoading && !this.bookIdInput.value); // Deshabilitar ISBN en modo edición
        this.bookListDiv.style.opacity = isLoading ? '0.7' : '1';
        UiHelper.toggleLoadingIndicator(this.loadingMessageElement, isLoading);
    }
}