import { UiHelper } from '../../utils/uiHelper.js';
import { BookCard } from '../components/BookCard.js';
import { BookViewModel } from '../viewmodels/BookViewModel.js';

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
        this.bookViewModel.resetCurrentBook(); // Notificar al ViewModel que el libro en edición ha sido reseteado
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
            this.isbnInput.disabled = true; // No permitir editar ISBN en PUT (por restricción UNIQUE)

            this.submitButton.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Libro';
            this.formTitle.textContent = `Editar Libro (ID: ${book.id})`;
            this.cancelButton.style.display = 'inline-block';
        } else {
            // Si book es null (indicando un reset desde el ViewModel), simplemente resetear el formulario.
            this.resetForm();
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
        event.preventDefault(); // Evitar el envío por defecto del formulario

        const id = this.bookIdInput.value; // Este ID se usará para la URL en PUT (es un string o vacío)
        const title = this.titleInput.value.trim();
        const author = this.authorInput.value.trim();
        const publicationYear = parseInt(this.publicationYearInput.value, 10);
        const isbn = this.isbnInput.value.trim();

        // Validaciones básicas de la vista (adicionales a las del servicio)
        if (!title || !author || !publicationYear || !isbn) {
            UiHelper.showNotification('Advertencia', 'Todos los campos son obligatorios.', 'warning');
            return;
        }
        if (isNaN(publicationYear) || publicationYear <= 0) {
            UiHelper.showNotification('Advertencia', 'Año de publicación debe ser un número positivo.', 'warning');
            return;
        }

        // --- CORRECCIÓN CLAVE AQUÍ: Construir el objeto de datos que se enviará en el BODY ---
        // Este objeto `bookDataForBody` contendrá SOLO las propiedades esperadas por BookCreateDTO/BookUpdateDTO.
        // El 'id' se pasa como un argumento SEPARADO al ViewModel.
        const bookDataForBody = { 
            title, 
            author, 
            publicationYear, 
            isbn 
        }; 

        try {
            // Pasamos el ID (string o vacío) y el objeto de datos del body al ViewModel.
            // El ViewModel determinará si es POST o PUT y usará el 'id' en la URL.
            await this.bookViewModel.saveBook(id, bookDataForBody); // <-- Cambio aquí: pasar ID y data por separado
            
            UiHelper.showNotification('Éxito', id ? 'Libro actualizado con éxito.' : 'Libro añadido con éxito.', 'success');
            this.resetForm(); // Resetear el formulario después de una operación exitosa
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
            console.error('Error en ViewModel:', error);
            UiHelper.showNotification('Error de Operación', error.message || 'Ha ocurrido un error.', 'error');
        }
    }

    /**
     * Maneja los cambios en el estado de carga reportados por el ViewModel.
     * @param {boolean} isLoading - True si está cargando, false si no.
     */
    handleLoadingState(isLoading) {
        // Deshabilitar/habilitar elementos del formulario
        UiHelper.setElementEnabled(this.submitButton, !isLoading);
        UiHelper.setElementEnabled(this.cancelButton, !isLoading);
        UiHelper.setElementEnabled(this.titleInput, !isLoading);
        UiHelper.setElementEnabled(this.authorInput, !isLoading);
        UiHelper.setElementEnabled(this.publicationYearInput, !isLoading);
        // Habilitar/deshabilitar ISBN: solo si NO está en modo edición (bookIdInput.value está vacío)
        UiHelper.setElementEnabled(this.isbnInput, !isLoading && !this.bookIdInput.value); 
        
        // Efecto visual en la lista de libros durante la carga
        this.bookListDiv.style.opacity = isLoading ? '0.7' : '1';
        UiHelper.toggleLoadingIndicator(this.loadingMessageElement, isLoading);
    }
}