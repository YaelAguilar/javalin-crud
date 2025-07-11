import { UiHelper } from "../../utils/uiHelper.js"
import { BookCard } from "../components/BookCard.js"
import { BookViewModel } from "../viewmodels/BookViewModel.js"

/**
 * @class BookView
 * @description La "View" en el patrón MVVM. Gestiona la interfaz de usuario,
 * escucha eventos del usuario y observa cambios en el ViewModel para actualizar el DOM.
 */
export class BookView {
  /**
   * @param {BookViewModel} bookViewModel - Instancia del ViewModel de libros.
   * @param {UIManager} uiManager - Instancia del gestor de UI.
   */
  constructor(bookViewModel, uiManager) {
    if (!bookViewModel || !(bookViewModel instanceof BookViewModel)) {
      throw new Error("BookView: Se requiere una instancia válida de BookViewModel.")
    }

    this.bookViewModel = bookViewModel
    this.uiManager = uiManager
    this.filteredBooks = []
    this.searchTerm = ""

    // Referencias a elementos del DOM
    this.initializeDOMReferences()

    // Suscribir la vista a los cambios del ViewModel
    this.subscribeToViewModel()

    // Configurar event listeners
    this.setupEventListeners()
  }

  initializeDOMReferences() {
    // Formulario
    this.bookForm = document.getElementById("book-form")
    this.bookIdInput = document.getElementById("book-id")
    this.titleInput = document.getElementById("title")
    this.authorInput = document.getElementById("author")
    this.publicationYearInput = document.getElementById("publicationYear")
    this.isbnInput = document.getElementById("isbn")
    this.submitButton = document.getElementById("submit-button")
    this.cancelButton = document.getElementById("cancel-button")
    this.formTitle = document.getElementById("form-title")

    // Lista de libros
    this.bookListDiv = document.getElementById("book-list")

    // Dashboard
    this.totalBooksEl = document.getElementById("total-books")
    this.recentBooksEl = document.getElementById("recent-books")
    this.uniqueAuthorsEl = document.getElementById("unique-authors")
    this.avgYearEl = document.getElementById("avg-year")
    this.recentBooksListEl = document.getElementById("recent-books-list")

    // Búsqueda
    this.searchInput = document.getElementById("search-input")
  }

  subscribeToViewModel() {
    this.bookViewModel.onBooksChanged = this.handleBooksChanged.bind(this)
    this.bookViewModel.onBookSelected = this.fillFormForEdit.bind(this)
    this.bookViewModel.onError = this.handleViewModelError.bind(this)
    this.bookViewModel.onLoadingChanged = this.handleLoadingState.bind(this)
  }

  setupEventListeners() {
    // Formulario
    if (this.bookForm) {
      this.bookForm.addEventListener("submit", this.handleSubmit.bind(this))
    }

    if (this.cancelButton) {
      this.cancelButton.addEventListener("click", this.handleCancelEdit.bind(this))
    }

    // Búsqueda
    document.addEventListener("bookSearch", (e) => {
      this.handleSearch(e.detail.searchTerm)
    })

    // Dashboard
    document.addEventListener("updateDashboard", () => {
      this.updateDashboardStats()
    })
  }

  handleBooksChanged(books) {
    this.filteredBooks = books
    this.renderBooks(books)
    this.updateDashboardStats()
    this.uiManager.updateBookCount(books.length)
    this.uiManager.updateShowingCount(books.length, books.length)
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase()
    const filtered = this.bookViewModel.books.filter(
      (book) =>
        book.title.toLowerCase().includes(this.searchTerm) ||
        book.author.toLowerCase().includes(this.searchTerm) ||
        book.isbn.toLowerCase().includes(this.searchTerm),
    )

    this.filteredBooks = filtered
    this.renderBooks(filtered)
    this.uiManager.updateShowingCount(filtered.length, this.bookViewModel.books.length)
  }

  /**
   * Resetea el formulario a su estado inicial.
   */
  resetForm() {
    if (this.bookForm) {
      this.bookForm.reset()
    }

    if (this.bookIdInput) this.bookIdInput.value = ""

    if (this.submitButton) {
      this.submitButton.innerHTML = '<i class="fas fa-save"></i><span>Agregar Libro</span>'
    }

    if (this.formTitle) {
      this.formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Libro'
    }

    if (this.cancelButton) {
      this.cancelButton.style.display = "none"
    }

    if (this.isbnInput) {
      this.isbnInput.disabled = false
    }

    this.bookViewModel.resetCurrentBook()
  }

  /**
   * Rellena el formulario con los datos de un libro para edición.
   * @param {Book} book - El libro a cargar en el formulario.
   */
  fillFormForEdit(book) {
    if (book) {
      if (this.bookIdInput) this.bookIdInput.value = book.id
      if (this.titleInput) this.titleInput.value = book.title
      if (this.authorInput) this.authorInput.value = book.author
      if (this.publicationYearInput) this.publicationYearInput.value = book.publicationYear
      if (this.isbnInput) {
        this.isbnInput.value = book.isbn
        this.isbnInput.disabled = true // No permitir editar ISBN
      }

      if (this.submitButton) {
        this.submitButton.innerHTML = '<i class="fas fa-sync-alt"></i><span>Actualizar Libro</span>'
      }

      if (this.formTitle) {
        this.formTitle.innerHTML = `<i class="fas fa-edit"></i> Editar Libro (ID: ${book.id})`
      }

      if (this.cancelButton) {
        this.cancelButton.style.display = "inline-flex"
      }

      // Cambiar a la pestaña del formulario
      this.uiManager.switchTab("form")
    } else {
      this.resetForm()
    }
  }

  /**
   * Renderiza la lista de libros en el DOM.
   * @param {Book[]} books - La lista de libros a mostrar.
   */
  renderBooks(books) {
    if (!this.bookListDiv) return

    this.bookListDiv.innerHTML = ""

    if (books.length > 0) {
      books.forEach((book) => {
        const bookCard = new BookCard(
          book,
          (id) => this.bookViewModel.selectBookForEdit(id),
          async (id) => {
            try {
              await this.bookViewModel.deleteBook(id)
              UiHelper.showNotification("Éxito", "Libro eliminado con éxito.", "success")
            } catch (error) {
              UiHelper.showNotification("Error", error.message || "Error al eliminar el libro.", "error")
            }
          },
        )
        this.bookListDiv.appendChild(bookCard.getElement())
      })
    } else {
      const message = this.searchTerm
        ? "No se encontraron libros que coincidan con tu búsqueda."
        : "No hay libros en la base de datos."

      const actionButton = !this.searchTerm
        ? {
            text: "Agregar Primer Libro",
            icon: "fas fa-plus",
            onclick: "switchTab('form')",
          }
        : null

      this.uiManager.showEmptyState(
        this.bookListDiv,
        this.searchTerm ? "Sin resultados" : "Biblioteca vacía",
        message,
        actionButton,
      )
    }
  }

  /**
   * Maneja el envío del formulario.
   * @param {Event} event - El evento de envío del formulario.
   */
  async handleSubmit(event) {
    event.preventDefault()

    const id = this.bookIdInput?.value || ""
    const title = this.titleInput?.value.trim() || ""
    const author = this.authorInput?.value.trim() || ""
    const publicationYear = Number.parseInt(this.publicationYearInput?.value, 10)
    const isbn = this.isbnInput?.value.trim() || ""

    // Validaciones
    if (!title || !author || !publicationYear || !isbn) {
      UiHelper.showNotification("Advertencia", "Todos los campos son obligatorios.", "warning")
      return
    }

    if (isNaN(publicationYear) || publicationYear <= 0 || publicationYear > new Date().getFullYear()) {
      UiHelper.showNotification("Advertencia", "Año de publicación debe ser válido.", "warning")
      return
    }

    const bookDataForBody = {
      title,
      author,
      publicationYear,
      isbn,
    }

    try {
      await this.bookViewModel.saveBook(id, bookDataForBody)
      UiHelper.showNotification("Éxito", id ? "Libro actualizado con éxito." : "Libro agregado con éxito.", "success")
      this.resetForm()

      // Cambiar a la pestaña de biblioteca para ver el resultado
      setTimeout(() => {
        this.uiManager.switchTab("library")
      }, 1000)
    } catch (error) {
      UiHelper.showNotification("Error", error.message || "Ocurrió un error inesperado.", "error")
    }
  }

  /**
   * Maneja el clic en cancelar edición.
   */
  handleCancelEdit() {
    this.resetForm()
  }

  /**
   * Maneja los errores del ViewModel.
   * @param {Error} error - El objeto de error.
   */
  handleViewModelError(error) {
    if (error) {
      console.error("Error en ViewModel:", error)
      UiHelper.showNotification("Error de Operación", error.message || "Ha ocurrido un error.", "error")
    }
  }

  /**
   * Maneja los cambios en el estado de carga.
   * @param {boolean} isLoading - True si está cargando.
   */
  handleLoadingState(isLoading) {
    // Deshabilitar/habilitar elementos del formulario
    const formElements = [
      this.submitButton,
      this.cancelButton,
      this.titleInput,
      this.authorInput,
      this.publicationYearInput,
    ]

    formElements.forEach((element) => {
      UiHelper.setElementEnabled(element, !isLoading)
    })

    // ISBN solo si no está en modo edición
    UiHelper.setElementEnabled(this.isbnInput, !isLoading && !this.bookIdInput?.value)

    // Efecto visual en la lista
    if (this.bookListDiv) {
      this.bookListDiv.style.opacity = isLoading ? "0.7" : "1"
    }

    // Mostrar loading en biblioteca si es necesario
    if (isLoading && this.uiManager.currentTab === "library") {
      this.uiManager.showLoadingState(this.bookListDiv, "Cargando libros...")
    }
  }

  /**
   * Actualiza las estadísticas del dashboard
   */
  updateDashboardStats() {
    const books = this.bookViewModel.books

    // Total de libros
    if (this.totalBooksEl) {
      this.totalBooksEl.textContent = books.length
    }

    // Libros agregados hoy
    const today = new Date().toDateString()
    const todayBooks = books.filter((book) => {
      const bookDate = new Date(book.createdAt).toDateString()
      return bookDate === today
    }).length

    if (this.recentBooksEl) {
      this.recentBooksEl.textContent = todayBooks
    }

    // Autores únicos
    const uniqueAuthors = new Set(books.map((book) => book.author)).size
    if (this.uniqueAuthorsEl) {
      this.uniqueAuthorsEl.textContent = uniqueAuthors
    }

    // Año promedio
    if (books.length > 0) {
      const avgYear = Math.round(books.reduce((sum, book) => sum + book.publicationYear, 0) / books.length)
      if (this.avgYearEl) {
        this.avgYearEl.textContent = avgYear
      }
    }

    // Libros recientes (últimos 3)
    this.renderRecentBooks(books.slice(-3).reverse())
  }

  /**
   * Renderiza los libros recientes en el dashboard
   * @param {Book[]} recentBooks - Los libros recientes
   */
  renderRecentBooks(recentBooks) {
    if (!this.recentBooksListEl) return

    if (recentBooks.length === 0) {
      this.recentBooksListEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>No hay libros recientes</p>
                </div>
            `
      return
    }

    this.recentBooksListEl.innerHTML = recentBooks
      .map(
        (book) => `
            <div class="book-item" style="cursor: pointer;" onclick="switchTab('library')">
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <p><i class="fas fa-user"></i> ${book.author}</p>
                    <p><i class="fas fa-calendar"></i> ${book.publicationYear}</p>
                </div>
            </div>
        `,
      )
      .join("")
  }
}
