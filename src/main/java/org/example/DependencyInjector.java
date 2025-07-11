package org.example;

import org.example.controllers.BookController;
import org.example.daos.IBookDAO;
import org.example.daos.impl.BookDAO;
import org.example.mappers.BookMapper;
import org.example.routes.BookRoutes;
import org.example.services.BookService;

/**
 * Clase que actúa como un "Composition Root" o "Contenedor de Inyección de Dependencias" manual.
 * Se encarga de instanciar y conectar todas las dependencias de la aplicación.
 */
public class DependencyInjector {

    private static IBookDAO bookDAO;
    private static BookMapper bookMapper;
    private static BookService bookService;
    private static BookController bookController;
    private static BookRoutes bookRoutes;

    /**
     * Inicializa y retorna una instancia de BookRoutes, que contiene
     * todas las dependencias de la aplicación pre-cableadas.
     * Este método asegura que cada componente se inicialice una única vez (singleton).
     * @return Una instancia de BookRoutes con todos sus componentes resueltos.
     */
    public static BookRoutes getBookRoutes() {
        if (bookDAO == null) {
            bookDAO = new BookDAO();
        }
        if (bookMapper == null) {
            bookMapper = new BookMapper();
        }
        if (bookService == null) {
            bookService = new BookService(bookDAO, bookMapper);
        }
        if (bookController == null) {
            bookController = new BookController(bookService);
        }
        if (bookRoutes == null) {
            bookRoutes = new BookRoutes(bookController);
        }
        return bookRoutes;
    }
}