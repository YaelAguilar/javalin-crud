// frontend/js/presentation/components/BookCard.js

import { Book } from '../../core/Book.js';
import { UiHelper } from '../../utils/uiHelper.js';

/**
 * @class BookCard
 * @description Componente de UI para representar un libro individual en la lista.
 * Se encarga de renderizar el HTML de un libro y de manejar los eventos de los botones.
 */
export class BookCard {
    /**
     * @param {Book} book - La entidad Book a renderizar.
     * @param {function(number): Promise<void>} onEdit - Callback cuando se hace clic en Editar.
     * @param {function(number): Promise<void>} onDelete - Callback cuando se hace clic en Eliminar.
     */
    constructor(book, onEdit, onDelete) {
        if (!(book instanceof Book)) {
            throw new Error('BookCard: El parámetro "book" debe ser una instancia de Book.');
        }
        this.book = book;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
        this.element = this.createCardElement();
    }

    /**
     * Crea el elemento HTML para la tarjeta del libro.
     * @returns {HTMLElement} El elemento div que representa la tarjeta del libro.
     */
    createCardElement() {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.id = this.book.id;

        // Formatear las fechas de forma legible
        const formattedCreatedAt = this.book.createdAt ? new Date(this.book.createdAt).toLocaleString() : 'N/A';
        const formattedUpdatedAt = this.book.updatedAt ? new Date(this.book.updatedAt).toLocaleString() : 'N/A';

        bookItem.innerHTML = `
            <div class="book-details">
                <h3>${this.book.title}</h3>
                <p><strong>Autor:</strong> ${this.book.author}</p>
                <p><strong>Año:</strong> ${this.book.publicationYear}</p>
                <p><strong>ISBN:</strong> ${this.book.isbn}</p>
                <div class="book-meta">
                    <p>ID: ${this.book.id} | Creado: ${formattedCreatedAt} | Actualizado: ${formattedUpdatedAt}</p>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-warning edit-btn" data-id="${this.book.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger delete-btn" data-id="${this.book.id}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `;

        bookItem.querySelector('.edit-btn').addEventListener('click', () => this.onEdit(this.book.id));
        bookItem.querySelector('.delete-btn').addEventListener('click', async () => {
            const confirmed = await UiHelper.showConfirmation(
                '¿Eliminar libro?', 
                `¿Estás seguro de que quieres eliminar "${this.book.title}"? Esta acción no se puede deshacer.`, 
                'warning'
            );
            if (confirmed) {
                this.onDelete(this.book.id);
            }
        });

        return bookItem;
    }

    /**
     * Obtiene el elemento DOM de la tarjeta del libro.
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }
}