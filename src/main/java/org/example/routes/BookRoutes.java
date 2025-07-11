package org.example.routes;

import io.javalin.Javalin;
import io.javalin.apibuilder.ApiBuilder;
import org.example.controllers.BookController;

/**
 * Clase que define y registra todas las rutas de la API para el recurso 'Book'.
 */
public class BookRoutes {

    private final BookController bookController;

    public BookRoutes(BookController bookController) {
        this.bookController = bookController;
    }

    public void register(Javalin app) {
        app.routes(() -> {
            ApiBuilder.path("/api/books", () -> {
                // POST /api/books - Crear libro
                ApiBuilder.post(bookController::create);

                // GET /api/books - Listar todos los libros
                ApiBuilder.get(bookController::getAll);

                // GET /api/books/{id} - Obtener libro por ID
                ApiBuilder.get("/{id}", bookController::getOne);

                // PUT /api/books/{id} - Actualizar libro por ID
                ApiBuilder.put("/{id}", bookController::update);

                // DELETE /api/books/{id} - Eliminar libro por ID
                ApiBuilder.delete("/{id}", bookController::delete);
            });
        });
    }
}