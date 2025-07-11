/**
 * @class UIManager
 * @description Gestiona la interfaz de usuario, navegación entre pestañas y funcionalidades generales de UI
 */
export class UIManager {
  constructor() {
    this.currentTab = "dashboard"
    this.currentTheme = localStorage.getItem("theme") || "light"
    this.currentView = "grid"

    this.initializeUI()
    this.setupEventListeners()
    this.applyTheme()
  }

  initializeUI() {
    // Configurar navegación de pestañas
    this.setupTabNavigation()

    // Configurar controles de vista
    this.setupViewControls()

    // Configurar tema
    this.setupThemeToggle()

    // Configurar búsqueda
    this.setupSearch()
  }

  setupEventListeners() {
    // Event listeners para pestañas
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab
        this.switchTab(tab)
      })
    })

    // Event listeners para controles de vista
    document.getElementById("grid-view")?.addEventListener("click", () => {
      this.setView("grid")
    })

    document.getElementById("list-view")?.addEventListener("click", () => {
      this.setView("list")
    })

    // Event listener para búsqueda
    document.getElementById("search-input")?.addEventListener("input", (e) => {
      this.handleSearch(e.target.value)
    })

    // Event listener para toggle de tema
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      this.toggleTheme()
    })

    // Hacer switchTab disponible globalmente
    window.switchTab = (tab) => this.switchTab(tab)
  }

  setupTabNavigation() {
    // Activar la pestaña inicial
    this.switchTab(this.currentTab)
  }

  switchTab(tabName) {
    // Remover clase active de todos los botones y contenidos
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    // Activar el botón y contenido seleccionado
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`)
    const activeContent = document.getElementById(`${tabName}-tab`)

    if (activeBtn && activeContent) {
      activeBtn.classList.add("active")
      activeContent.classList.add("active")
      this.currentTab = tabName

      // Trigger events específicos para cada pestaña
      this.onTabSwitch(tabName)
    }
  }

  onTabSwitch(tabName) {
    switch (tabName) {
      case "dashboard":
        // Actualizar estadísticas del dashboard
        this.updateDashboardStats()
        break
      case "library":
        // Enfocar en el campo de búsqueda
        setTimeout(() => {
          document.getElementById("search-input")?.focus()
        }, 100)
        break
    }
  }

  setupViewControls() {
    this.setView(this.currentView)
  }

  setView(viewType) {
    const bookList = document.getElementById("book-list")
    const gridBtn = document.getElementById("grid-view")
    const listBtn = document.getElementById("list-view")

    if (!bookList) return

    // Remover clases de vista
    bookList.classList.remove("book-grid", "book-list")
    gridBtn?.classList.remove("active")
    listBtn?.classList.remove("active")

    // Aplicar nueva vista
    if (viewType === "list") {
      bookList.classList.add("book-grid", "list-view")
      listBtn?.classList.add("active")
    } else {
      bookList.classList.add("book-grid")
      gridBtn?.classList.add("active")
    }

    this.currentView = viewType
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      this.updateThemeIcon()
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light"
    this.applyTheme()
    localStorage.setItem("theme", this.currentTheme)
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme)
    this.updateThemeIcon()
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      const icon = themeToggle.querySelector("i")
      if (icon) {
        icon.className = this.currentTheme === "light" ? "fas fa-moon" : "fas fa-sun"
      }
    }
  }

  setupSearch() {
    // La funcionalidad de búsqueda será manejada por BookView
    // Aquí solo configuramos el UI
  }

  handleSearch(searchTerm) {
    // Emitir evento personalizado para que BookView lo maneje
    const searchEvent = new CustomEvent("bookSearch", {
      detail: { searchTerm },
    })
    document.dispatchEvent(searchEvent)
  }

  updateDashboardStats() {
    // Este método será llamado por BookView para actualizar las estadísticas
    const event = new CustomEvent("updateDashboard")
    document.dispatchEvent(event)
  }

  updateBookCount(count) {
    const totalBooksHeader = document.getElementById("total-books-header")
    if (totalBooksHeader) {
      totalBooksHeader.textContent = count
    }
  }

  updateShowingCount(showing, total) {
    const showingCount = document.getElementById("showing-count")
    if (showingCount) {
      showingCount.textContent = `Mostrando ${showing} de ${total} libros`
    }
  }

  showLoadingState(container, message = "Cargando...") {
    if (container) {
      container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            `
    }
  }

  showEmptyState(container, title = "No hay elementos", message = "", actionButton = null) {
    if (container) {
      const actionHtml = actionButton
        ? `<button class="btn btn-primary" onclick="${actionButton.onclick}">
                    <i class="${actionButton.icon}"></i>
                    ${actionButton.text}
                </button>`
        : ""

      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    ${actionHtml}
                </div>
            `
    }
  }
}
