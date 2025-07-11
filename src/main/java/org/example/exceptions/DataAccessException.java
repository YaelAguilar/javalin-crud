package org.example.exceptions;

/**
 * Excepción general para errores ocurridos en la capa de acceso a datos (DAO).
 */
public class DataAccessException extends RuntimeException {
    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}