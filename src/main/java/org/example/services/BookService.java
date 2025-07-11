package org.example.services;

import org.example.daos.IBookDAO;
import org.example.mappers.BookMapper;
import org.example.models.Book;
import org.example.models.dtos.BookCreateDTO;
import org.example.models.dtos.BookDTO;
import org.example.models.dtos.BookUpdateDTO;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Servicio que contiene la lógica de negocio para las operaciones CRUD de libros.
 * Orquesta el uso de la capa DAO y la capa de mapeo.
 */
public class BookService {

    private final IBookDAO bookDAO;
    private final BookMapper bookMapper; // Inyectar el mapper

    public BookService(IBookDAO bookDAO, BookMapper bookMapper) {
        this.bookDAO = bookDAO;
        this.bookMapper = bookMapper;
    }

    /**
     * Crea un nuevo libro.
     * @param dto El DTO con los datos del libro a crear.
     * @return El DTO del libro recién creado.
     */
    public BookDTO createBook(BookCreateDTO dto) {
        // Validaciones básicas de negocio
        if (dto.title() == null || dto.title().isBlank() ||
            dto.author() == null || dto.author().isBlank()) {
            throw new IllegalArgumentException("El título y el autor son obligatorios.");
        }
        if (dto.publicationYear() <= 0) {
            throw new IllegalArgumentException("El año de publicación debe ser un número positivo.");
        }
        // Opcional: Validar formato ISBN

        // Mapear DTO a entidad
        Book newBook = bookMapper.toEntity(dto);
        
        // Guardar en la base de datos
        Book savedBook = bookDAO.save(newBook);

        // Mapear entidad guardada a DTO de respuesta
        return bookMapper.toDto(savedBook);
    }

    /**
     * Obtiene un libro por su ID.
     * @param id El ID del libro.
     * @return El DTO del libro.
     * @throws NoSuchElementException si el libro no se encuentra.
     */
    public BookDTO getBookById(int id) {
        return bookDAO.findById(id)
                .map(bookMapper::toDto) // Mapear a DTO si se encuentra
                .orElseThrow(() -> new NoSuchElementException("Libro no encontrado con ID: " + id));
    }

    /**
     * Obtiene una lista de todos los libros.
     * @return Una lista de DTOs de libros.
     */
    public List<BookDTO> getAllBooks() {
        List<Book> books = bookDAO.findAll();
        return bookMapper.toDtoList(books); // Mapear la lista de entidades a DTOs
    }

    /**
     * Actualiza un libro existente.
     * @param id El ID del libro a actualizar.
     * @param dto El DTO con los datos de actualización.
     * @return El DTO del libro actualizado.
     * @throws NoSuchElementException si el libro no se encuentra.
     * @throws IllegalArgumentException si los datos de actualización no son válidos.
     */
    public BookDTO updateBook(int id, BookUpdateDTO dto) {
        // Primero, buscar el libro para asegurarse de que existe
        Book existingBook = bookDAO.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Libro no encontrado con ID: " + id));
        
        // Validaciones básicas de negocio para la actualización
        if (dto.title() == null || dto.title().isBlank() ||
            dto.author() == null || dto.author().isBlank()) {
            throw new IllegalArgumentException("El título y el autor son obligatorios.");
        }
        if (dto.publicationYear() <= 0) {
            throw new IllegalArgumentException("El año de publicación debe ser un número positivo.");
        }

        // Mapear datos del DTO a la entidad existente
        bookMapper.updateEntityFromDto(existingBook, dto);

        // Guardar los cambios en la base de datos
        Book updatedBook = bookDAO.update(existingBook)
                .orElseThrow(() -> new RuntimeException("No se pudo actualizar el libro con ID: " + id));
        
        // Mapear la entidad actualizada a DTO de respuesta
        return bookMapper.toDto(updatedBook);
    }

    /**
     * Elimina un libro por su ID.
     * @param id El ID del libro a eliminar.
     * @throws NoSuchElementException si el libro no se encuentra.
     * @throws RuntimeException si la eliminación falla por una razón inesperada.
     */
    public void deleteBook(int id) {
        // Primero, verificar que el libro exista antes de intentar eliminarlo
        bookDAO.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Libro no encontrado con ID: " + id));

        // Eliminar de la base de datos
        boolean deleted = bookDAO.deleteById(id);
        if (!deleted) {
            throw new RuntimeException("No se pudo eliminar el libro con ID: " + id);
        }
    }
}