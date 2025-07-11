package org.example.models.dtos;

import java.time.LocalDateTime;

/**
 * DTO para la representación de un libro en las respuestas de la API (datos de salida para GET).
 */
public record BookDTO(int id, String title, String author, int publicationYear, String isbn, LocalDateTime createdAt, LocalDateTime updatedAt) {}