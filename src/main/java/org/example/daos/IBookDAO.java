package org.example.daos;

import org.example.models.Book;
import java.util.List;
import java.util.Optional;

/**
 * Interfaz que define las operaciones de acceso a datos para la entidad Book.
 */
public interface IBookDAO {

    /**
     * Guarda un nuevo libro en la base de datos.
     * @param book El objeto Book a guardar, con sus campos (ID será generado).
     * @return El objeto Book guardado, ahora con su ID asignado.
     */
    Book save(Book book);

    /**
     * Busca un libro por su ID único.
     * @param id El ID del libro a buscar.
     * @return Un Optional que contiene el Book si se encuentra, o un Optional vacío si no.
     */
    Optional<Book> findById(int id);

    /**
     * Recupera todos los libros de la base de datos.
     * @return Una lista de todos los libros.
     */
    List<Book> findAll();

    /**
     * Actualiza un libro existente en la base de datos.
     * @param book El objeto Book con los datos actualizados (debe contener un ID válido).
     * @return Un Optional que contiene el Book actualizado si la operación fue exitosa, o un Optional vacío si no se encontró el libro.
     */
    Optional<Book> update(Book book);

    /**
     * Elimina un libro de la base de datos por su ID.
     * @param id El ID del libro a eliminar.
     * @return true si el libro fue eliminado exitosamente, false en caso contrario.
     */
    boolean deleteById(int id);
}