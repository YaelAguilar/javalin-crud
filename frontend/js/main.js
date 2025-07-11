import { BookApiService } from "./data/services/BookApiService.js"
import { BookRepository } from "./data/repositories/BookRepository.js"
import { BookViewModel } from "./presentation/viewmodels/BookViewModel.js"
import { BookView } from "./presentation/views/BookView.js"
import { UIManager } from "./utils/UIManager.js"

/**
 * Función principal que se ejecuta cuando el DOM está completamente cargado.
 * Actúa como el "Composition Root" de la aplicación,
 * instanciando y conectando todas las dependencias.
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded. Initializing BiblioGestión Pro...")

  // Inicializar el gestor de UI
  const uiManager = new UIManager()

  // 1. Instanciar la capa de Servicios (API Clients)
  const bookApiService = new BookApiService()
  console.log("BookApiService initialized.")

  // 2. Instanciar la capa de Repositorios (Data Abstraction)
  const bookRepository = new BookRepository(bookApiService)
  console.log("BookRepository initialized.")

  // 3. Instanciar la capa de ViewModel (Presentation Logic)
  const bookViewModel = new BookViewModel(bookRepository)
  console.log("BookViewModel initialized.")

  // 4. Instanciar la capa de Vista (UI Interaction)
  const bookView = new BookView(bookViewModel, uiManager)
  console.log("BookView initialized.")

  // 5. Iniciar la carga inicial de datos
  bookViewModel
    .loadBooks()
    .then(() => {
      console.log("Initial books loaded.")
    })
    .catch((error) => {
      console.error("Failed to load initial books:", error)
    })

  console.log("BiblioGestión Pro initialization complete.")
})
