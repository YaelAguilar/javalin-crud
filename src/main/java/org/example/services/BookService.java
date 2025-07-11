package org.example.services;

import org.example.daos.IBookDAO;
import org.example.exceptions.DataAccessException;
import org.example.exceptions.DuplicateIsbnException;
import org.example.mappers.BookMapper;
import org.example.models.Book;
import org.example.models.dtos.BookCreateDTO;
import org.example.models.dtos.BookDTO;
import org.example.models.dtos.BookUpdateDTO;

import java.util.List;
import java.util.NoSuchElementException;

public class BookService {

    private final IBookDAO bookDAO;
    private final BookMapper bookMapper;

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

        try {
            // Mapear DTO a entidad
            Book newBook = bookMapper.toEntity(dto);
            
            // Guardar en la base de datos
            Book savedBook = bookDAO.save(newBook);

            // Mapear entidad guardada a DTO de respuesta
            return bookMapper.toDto(savedBook);
        } catch (DataAccessException e) { // <-- Capturar DataAccessException
            // Comprobar si el mensaje indica un duplicado de ISBN específico
            if (e.getMessage().contains("Clave duplicada: El ISBN ya existe.")) { 
                throw new DuplicateIsbnException("El ISBN '" + dto.isbn() + "' ya está registrado.", e);
            }
            throw e; // Relanzar otras DataAccessExceptions que no sean de ISBN duplicado
        }
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
        try {
            Book updatedBook = bookDAO.update(existingBook)
                    .orElseThrow(() -> new RuntimeException("No se pudo actualizar el libro con ID: " + id));
            return bookMapper.toDto(updatedBook);
        } catch (DataAccessException e) { // <-- Capturar DataAccessException también en update
            if (e.getMessage().contains("Clave duplicada: El ISBN ya existe.")) { 
                throw new DuplicateIsbnException("El ISBN '" + dto.isbn() + "' ya está registrado.", e);
            }
            throw e;
        }
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