package org.example.daos.impl;

import org.example.configs.DbConfig;
import org.example.daos.IBookDAO;
import org.example.exceptions.DataAccessException;
import org.example.models.Book;
import org.intellij.lang.annotations.Language;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class BookDAO implements IBookDAO {

    @Override
    public Book save(Book book) {
        @Language("MySQL")
        String sql = "INSERT INTO books (title, author, publication_year, isbn) VALUES (?, ?, ?, ?)";
        try (Connection conn = DbConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getAuthor());
            pstmt.setInt(3, book.getPublicationYear());
            pstmt.setString(4, book.getIsbn());
            pstmt.executeUpdate();

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    book.setId(generatedKeys.getInt(1));
                } else {
                    throw new SQLException("La creación del libro falló, no se obtuvo ID.");
                }
            }
            return book;
        } catch (SQLIntegrityConstraintViolationException e) { // <-- Captura específica de duplicados
            // MySQL lanza esta si hay una restricción UNIQUE o PRIMARY KEY violada (código 1062 para 'Duplicate entry')
            if (e.getErrorCode() == 1062) { 
                System.err.println("Error de duplicado en DB (ISBN): " + e.getMessage());
                throw new DataAccessException("Clave duplicada: El ISBN ya existe.", e); // Lanzar DataAccessException
            }
            // Si no es un duplicado, relanzar como DataAccessException genérico
            System.err.println("Error de integridad de BD al guardar el libro: " + e.getMessage());
            throw new DataAccessException("Error de integridad en la base de datos al guardar el libro.", e);
        } catch (SQLException e) { // <-- Captura otras excepciones SQL
            System.err.println("Error SQL al guardar el libro: " + e.getMessage());
            throw new DataAccessException("Error de base de datos al guardar el libro.", e); // Relanzar como DataAccessException
        }
    }

    @Override
    public Optional<Book> findById(int id) {
        @Language("MySQL")
        String sql = "SELECT * FROM books WHERE id = ?";
        try (Connection conn = DbConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToBook(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar libro por ID: " + e.getMessage());
            throw new DataAccessException("Error de base de datos al buscar el libro por ID.", e); // Usar DataAccessException
        }
        return Optional.empty();
    }

    @Override
    public List<Book> findAll() {
        List<Book> books = new ArrayList<>();
        @Language("MySQL")
        String sql = "SELECT * FROM books ORDER BY title ASC";
        try (Connection conn = DbConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                books.add(mapRowToBook(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar todos los libros: " + e.getMessage());
            throw new DataAccessException("Error de base de datos al buscar todos los libros.", e); // Usar DataAccessException
        }
        return books;
    }

    @Override
    public Optional<Book> update(Book book) {
        @Language("MySQL")
        String sql = "UPDATE books SET title = ?, author = ?, publication_year = ?, isbn = ? WHERE id = ?";
        try (Connection conn = DbConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getAuthor());
            pstmt.setInt(3, book.getPublicationYear());
            pstmt.setString(4, book.getIsbn());
            pstmt.setInt(5, book.getId());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                // Para asegurar que los timestamps de updated_at estén actualizados
                return findById(book.getId());
            }
        } catch (SQLException e) {
            System.err.println("Error al actualizar el libro: " + e.getMessage());
            throw new DataAccessException("Error de base de datos al actualizar el libro.", e); // Usar DataAccessException
        }
        return Optional.empty();
    }

    @Override
    public boolean deleteById(int id) {
        @Language("MySQL")
        String sql = "DELETE FROM books WHERE id = ?";
        try (Connection conn = DbConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0; // True si se eliminó al menos una fila
        } catch (SQLException e) {
            System.err.println("Error al eliminar el libro: " + e.getMessage());
            throw new DataAccessException("Error de base de datos al eliminar el libro.", e); // Usar DataAccessException
        }
    }
        
    private Book mapRowToBook(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getInt("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setPublicationYear(rs.getInt("publication_year"));
        book.setIsbn(rs.getString("isbn"));
        book.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        book.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        return book;
    }
}