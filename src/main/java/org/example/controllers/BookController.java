package org.example.controllers;

import io.javalin.http.Context;
import org.example.models.dtos.BookCreateDTO;
import org.example.models.dtos.BookUpdateDTO;
import org.example.services.BookService;

import java.util.Map;
import java.util.NoSuchElementException; // Para 404 Not Found

/**
 * Controlador que maneja las peticiones HTTP para el recurso 'Book'.
 * Delega la lógica de negocio al BookService.
 */
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /**
     * POST /api/books - Crea un nuevo libro.
     */
    public void create(Context ctx) {
        try {
            BookCreateDTO bookDTO = ctx.bodyAsClass(BookCreateDTO.class);
            var newBook = bookService.createBook(bookDTO);
            ctx.status(201).json(Map.of("success", true, "message", "Libro creado con éxito.", "data", newBook));
        } catch (IllegalArgumentException e) {
            // Captura errores de validación del servicio
            ctx.status(400).json(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * GET /api/books/{id} - Obtiene un libro por su ID.
     */
    public void getOne(Context ctx) {
        // Parsear el ID del path. NumberFormatException será capturado por el manejador de Exception si el ID no es int.
        int id = Integer.parseInt(ctx.pathParam("id"));
        
        // La NoSuchElementException será capturada por el manejador global de 404
        var book = bookService.getBookById(id);
        ctx.status(200).json(Map.of("success", true, "data", book));
    }

    /**
     * GET /api/books - Obtiene todos los libros.
     */
    public void getAll(Context ctx) {
        var books = bookService.getAllBooks();
        ctx.status(200).json(Map.of("success", true, "data", books));
    }

    /**
     * PUT /api/books/{id} - Actualiza un libro existente.
     */
    public void update(Context ctx) {
        // Parsear el ID del path
        int id = Integer.parseInt(ctx.pathParam("id"));
        
        try {
            BookUpdateDTO bookDTO = ctx.bodyAsClass(BookUpdateDTO.class);
            var updatedBook = bookService.updateBook(id, bookDTO);
            ctx.status(200).json(Map.of("success", true, "message", "Libro actualizado con éxito.", "data", updatedBook));
        } catch (NoSuchElementException e) {
            // Captura errores de "no encontrado" si el servicio lanza la excepción
            ctx.status(404).json(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            // Captura errores de validación del servicio
            ctx.status(400).json(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/books/{id} - Elimina un libro.
     */
    public void delete(Context ctx) {
        // Parsear el ID del path
        int id = Integer.parseInt(ctx.pathParam("id"));
        
        try {
            bookService.deleteBook(id);
            ctx.status(204); // 204 No Content para eliminación exitosa
        } catch (NoSuchElementException e) {
            // Captura errores de "no encontrado" si el servicio lanza la excepción
            ctx.status(404).json(Map.of("success", false, "message", e.getMessage()));
        }
    }
}