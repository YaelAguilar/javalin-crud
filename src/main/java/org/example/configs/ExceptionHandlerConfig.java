package org.example.configs;

import io.javalin.Javalin;
import org.example.exceptions.DataAccessException;
import org.example.exceptions.DuplicateIsbnException;
import java.util.Map;
import java.util.NoSuchElementException;
import java.lang.IllegalArgumentException;
import java.lang.NumberFormatException;

public class ExceptionHandlerConfig {

    public static void register(Javalin app) {
        // Maneja NoSuchElementException (generalmente un 404 Not Found)
        app.exception(NoSuchElementException.class, (e, ctx) -> {
            ctx.status(404).json(Map.of("success", false, "message", e.getMessage()));
        });

        // Maneja IllegalArgumentException (generalmente un 400 Bad Request por validación de entrada)
        app.exception(IllegalArgumentException.class, (e, ctx) -> {
            ctx.status(400).json(Map.of("success", false, "message", e.getMessage()));
        });

        // Maneja NumberFormatException (si un pathParam o queryParam no es un número válido)
        app.exception(NumberFormatException.class, (e, ctx) -> {
            ctx.status(400).json(Map.of("success", false, "message", "ID no válido. Debe ser un número entero."));
        });

        // NUEVO MANEJADOR: Para ISBN duplicado (400 Bad Request)
        app.exception(DuplicateIsbnException.class, (e, ctx) -> {
            ctx.status(400).json(Map.of("success", false, "message", e.getMessage()));
        });
        
        // Manejador genérico para DataAccessException (errores de BD que no sean duplicados específicos)
        app.exception(DataAccessException.class, (e, ctx) -> {
            System.err.println("Error en la capa de acceso a datos: " + e.getMessage());
            e.printStackTrace(); // Para depuración
            ctx.status(500).json(Map.of("success", false, "message", "Error de base de datos al procesar la solicitud."));
        });

        // Manejador "catch-all" para cualquier otra Exception no controlada
        app.exception(Exception.class, (e, ctx) -> {
            System.err.println("Error no controlado: " + e.getMessage());
            e.printStackTrace(); // ¡Importante para debugging!
            ctx.status(500).json(Map.of("success", false, "message", "Error interno del servidor. Contacte al administrador."));
        });
        
        // Manejador para errores 404 de rutas no encontradas (cuando el endpoint no existe en Javalin)
        app.error(404, ctx -> {
            if (ctx.result() == null) { // Solo si no se ha escrito ya una respuesta
                ctx.json(Map.of("success", false, "message", "Endpoint no encontrado: " + ctx.method() + " " + ctx.path()));
            }
        });
    }
}