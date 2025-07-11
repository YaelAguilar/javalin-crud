package org.example.models.dtos;

/**
 * DTO para la actualización de un libro existente (datos de entrada para PUT).
 */
public record BookUpdateDTO(String title, String author, int publicationYear, String isbn) {}