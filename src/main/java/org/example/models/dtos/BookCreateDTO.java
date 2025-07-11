package org.example.models.dtos;

/**
 * DTO para la creación de un nuevo libro (datos de entrada para POST).
 * Usamos un 'record' para una clase de datos inmutable y concisa.
 */
public record BookCreateDTO(String title, String author, int publicationYear, String isbn) {}