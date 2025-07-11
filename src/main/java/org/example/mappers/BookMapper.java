package org.example.mappers;

import org.example.models.Book;
import org.example.models.dtos.BookCreateDTO;
import org.example.models.dtos.BookDTO;
import org.example.models.dtos.BookUpdateDTO;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase de utilidad para mapear entre entidades Book y sus respectivos DTOs.
 */
public class BookMapper {

    /**
     * Convierte un BookCreateDTO (request de creación) a una entidad Book.
     * @param dto El DTO de entrada.
     * @return La entidad Book correspondiente.
     */
    public Book toEntity(BookCreateDTO dto) {
        Book book = new Book();
        book.setTitle(dto.title());
        book.setAuthor(dto.author());
        book.setPublicationYear(dto.publicationYear());
        book.setIsbn(dto.isbn());
        return book;
    }

    /**
     * Aplica los datos de un BookUpdateDTO a una entidad Book existente.
     * @param existingBook La entidad Book a actualizar.
     * @param dto El DTO con los datos de actualización.
     */
    public void updateEntityFromDto(Book existingBook, BookUpdateDTO dto) {
        existingBook.setTitle(dto.title());
        existingBook.setAuthor(dto.author());
        existingBook.setPublicationYear(dto.publicationYear());
        existingBook.setIsbn(dto.isbn());
    }

    /**
     * Convierte una entidad Book a un BookDTO (respuesta de API).
     * @param book La entidad Book.
     * @return El DTO de salida correspondiente.
     */
    public BookDTO toDto(Book book) {
        if (book == null) {
            return null;
        }
        return new BookDTO(
            book.getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getPublicationYear(),
            book.getIsbn(),
            book.getCreatedAt(),
            book.getUpdatedAt()
        );
    }

    /**
     * Convierte una lista de entidades Book a una lista de BookDTOs.
     * @param books La lista de entidades Book.
     * @return La lista de DTOs de salida.
     */
    public List<BookDTO> toDtoList(List<Book> books) {
        return books.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}