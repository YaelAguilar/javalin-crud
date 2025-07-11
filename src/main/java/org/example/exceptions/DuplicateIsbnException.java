package org.example.exceptions;

/**
 * Excepción personalizada para indicar que un ISBN ya existe en la base de datos.
 * Se mapea a un 400 Bad Request o 409 Conflict en la API.
 */
public class DuplicateIsbnException extends RuntimeException {
    public DuplicateIsbnException(String message) {
        super(message);
    }

    public DuplicateIsbnException(String message, Throwable cause) {
        super(message, cause);
    }
}