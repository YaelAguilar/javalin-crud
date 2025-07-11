// frontend/js/presentation/viewmodels/BookViewModel.js

import { Book } from '../../core/Book.js'; // Necesitamos la entidad Book para la lista
import { BookRepository } from '../../data/repositories/BookRepository.js'; // Accedemos al Repositorio

/**
 * @class BookViewModel
 * @description Lógica de presentación para la gestión de libros.
 * Gestiona el estado de la aplicación (lista de libros, libro en edición)
 * y las acciones CRUD, comunicándose con el BookRepository.
 */
export class BookViewModel {
    /**
     * @param {BookRepository} bookRepository - Instancia del repositorio de libros.
     */
    constructor(bookRepository) {
        if (!bookRepository || !(bookRepository instanceof BookRepository)) {
            throw new Error('BookViewModel: Se requiere una instancia válida de BookRepository.');
        }
        this.bookRepository = bookRepository;
        this.books = []; // Lista de libros observables
        this.currentBook = null; // Libro actualmente en edición
        this.error = null; // Último error ocurrido
        this.loading = false; // Estado de carga para la UI

        // Callbacks para notificar a la vista sobre cambios de estado o errores
        this.onBooksChanged = () => {}; // Se llamará cuando `books` se actualice
        this.onBookSelected = () => {}; // Se llamará cuando `currentBook` se establezca para edición
        this.onError = () => {}; // Se llamará cuando ocurra un error
        this.onLoadingChanged = () => {}; // Se llamará cuando `loading` cambie
    }

    /**
     * Carga todos los libros desde el repositorio y actualiza el estado.
     */
    async loadBooks() {
        this.setLoading(true);
        try {
            this.books = await this.bookRepository.getAllBooks();
            this.error = null;
            this.onBooksChanged(this.books); // Notificar a la vista
        } catch (error) {
            this.setError(error); // Establecer y notificar error
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Establece el libro actual para edición.
     * @param {number} id - El ID del libro a editar.
     */
    async selectBookForEdit(id) {
        this.setLoading(true);
        try {
            this.currentBook = await this.bookRepository.getBookById(id);
            this.error = null;
            this.onBookSelected(this.currentBook); // Notificar a la vista
        } catch (error) {
            this.setError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Crea un nuevo libro o actualiza uno existente.
     * @param {object} bookData - Los datos del libro (puede incluir ID para actualización).
     */
    async saveBook(bookData) {
        this.setLoading(true);
        try {
            let savedBook;
            if (bookData.id) {
                // Actualizar
                savedBook = await this.bookRepository.updateBook(bookData.id, bookData);
            } else {
                // Crear
                savedBook = await this.bookRepository.createBook(bookData);
            }
            this.error = null;
            await this.loadBooks(); // Recargar la lista después de guardar/actualizar
            return savedBook;
        } catch (error) {
            this.setError(error);
            throw error; // Propagar el error para que la UI pueda reaccionar (ej. no cerrar formulario)
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Elimina un libro.
     * @param {number} id - El ID del libro a eliminar.
     */
    async deleteBook(id) {
        this.setLoading(true);
        try {
            const success = await this.bookRepository.deleteBook(id);
            if (success) {
                this.error = null;
                await this.loadBooks(); // Recargar la lista después de eliminar
            } else {
                throw new Error(`No se pudo eliminar el libro con ID ${id}.`);
            }
        } catch (error) {
            this.setError(error);
            throw error; // Propagar el error
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Resetea el libro en edición.
     */
    resetCurrentBook() {
        this.currentBook = null;
        this.onBookSelected(null); // Notificar a la vista
    }

    /**
     * Establece el estado de carga y notifica a la vista.
     * @param {boolean} isLoading
     */
    setLoading(isLoading) {
        this.loading = isLoading;
        this.onLoadingChanged(this.loading);
    }

    /**
     * Establece el error y notifica a la vista.
     * @param {Error} error
     */
    setError(error) {
        this.error = error;
        this.onError(this.error);
    }
}