import { Book } from "../../core/Book.js"
import { UiHelper } from "../../utils/uiHelper.js"

/**
 * @class BookCard
 * @description Componente de UI para representar un libro individual en la lista.
 */
export class BookCard {
  /**
   * @param {Book} book - La entidad Book a renderizar.
   * @param {function(number): Promise<void>} onEdit - Callback cuando se hace clic en Editar.
   * @param {function(number): Promise<void>} onDelete - Callback cuando se hace clic en Eliminar.
   */
  constructor(book, onEdit, onDelete) {
    if (!(book instanceof Book)) {
      throw new Error('BookCard: El parámetro "book" debe ser una instancia de Book.')
    }
    this.book = book
    this.onEdit = onEdit
    this.onDelete = onDelete
    this.element = this.createCardElement()
  }

  /**
   * Crea el elemento HTML para la tarjeta del libro.
   * @returns {HTMLElement} El elemento div que representa la tarjeta del libro.
   */
  createCardElement() {
    const bookItem = document.createElement("div")
    bookItem.className = "book-item"
    bookItem.dataset.id = this.book.id

    const formattedCreatedAt = UiHelper.formatDate(this.book.createdAt)
    const formattedUpdatedAt = UiHelper.formatDate(this.book.updatedAt)

    bookItem.innerHTML = `
            <div class="book-details">
                <h3>${this.escapeHtml(this.book.title)}</h3>
                <p><i class="fas fa-user"></i> <strong>Autor:</strong> ${this.escapeHtml(this.book.author)}</p>
                <p><i class="fas fa-calendar"></i> <strong>Año:</strong> ${this.book.publicationYear}</p>
                <p><i class="fas fa-barcode"></i> <strong>ISBN:</strong> ${this.escapeHtml(this.book.isbn)}</p>
                <div class="book-meta">
                    <p><i class="fas fa-info-circle"></i> ID: ${this.book.id}</p>
                    <p><i class="fas fa-plus"></i> Creado: ${formattedCreatedAt}</p>
                    <p><i class="fas fa-edit"></i> Actualizado: ${formattedUpdatedAt}</p>
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
        `

    // Event listeners
    const editBtn = bookItem.querySelector(".edit-btn")
    const deleteBtn = bookItem.querySelector(".delete-btn")

    if (editBtn) {
      editBtn.addEventListener("click", () => this.onEdit(this.book.id))
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const confirmed = await UiHelper.showConfirmation(
          "¿Eliminar libro?",
          `¿Estás seguro de que quieres eliminar "${this.book.title}"? Esta acción no se puede deshacer.`,
          "warning",
        )
        if (confirmed) {
          this.onDelete(this.book.id)
        }
      })
    }

    return bookItem
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Obtiene el elemento DOM de la tarjeta del libro.
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element
  }
}
