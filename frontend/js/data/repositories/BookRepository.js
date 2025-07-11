// frontend/js/data/repositories/BookRepository.js

import { Book } from '../../core/Book.js'; // Importamos la entidad Book
import { BookApiService } from '../services/BookApiService.js'; // Importamos el servicio API

/**
 * @class BookRepository
 * @description Repositorio que maneja las operaciones CRUD para libros.
 * Actúa como una abstracción sobre el BookApiService, devolviendo entidades de dominio.
 */
export class BookRepository {
    /**
     * @param {BookApiService} bookApiService - Instancia del servicio API de libros.
     */
    constructor(bookApiService) {
        if (!bookApiService || !(bookApiService instanceof BookApiService)) {
            throw new Error('BookRepository: Se requiere una instancia válida de BookApiService.');
        }
        this.bookApiService = bookApiService;
    }

    /**
     * Obtiene todos los libros.
     * @returns {Promise<Book[]>} Una promesa que resuelve con una lista de entidades Book.
     */
    async getAllBooks() {
        try {
            const response = await this.bookApiService.getAll();
            if (response.success && Array.isArray(response.data)) {
                return response.data.map(Book.fromJson); // Mapeamos el JSON a entidades Book
            }
            throw new Error(response.message || 'Error desconocido al obtener todos los libros.');
        } catch (error) {
            console.error('Error en BookRepository.getAllBooks:', error);
            throw error; // Relanzamos el error para la capa superior
        }
    }

    /**
     * Obtiene un libro por su ID.
     * @param {number} id - El ID del libro.
     * @returns {Promise<Book>} Una promesa que resuelve con la entidad Book.
     */
    async getBookById(id) {
        try {
            const response = await this.bookApiService.getById(id);
            if (response.success && response.data) {
                return Book.fromJson(response.data); // Mapeamos el JSON a una entidad Book
            }
            throw new Error(response.message || `Libro con ID ${id} no encontrado.`);
        } catch (error) {
            console.error(`Error en BookRepository.getBookById(${id}):`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo libro.
     * @param {object} bookData - Los datos del libro a crear (sin ID).
     * @returns {Promise<Book>} Una promesa que resuelve con la entidad Book creada.
     */
    async createBook(bookData) {
        try {
            const response = await this.bookApiService.create(bookData);
            if (response.success && response.data) {
                return Book.fromJson(response.data);
            }
            throw new Error(response.message || 'Error desconocido al crear el libro.');
        } catch (error) {
            console.error('Error en BookRepository.createBook:', error);
            throw error;
        }
    }

    /**
     * Actualiza un libro existente.
     * @param {number} id - El ID del libro a actualizar.
     * @param {object} bookData - Los datos actualizados del libro.
     * @returns {Promise<Book>} Una promesa que resuelve con la entidad Book actualizada.
     */
    async updateBook(id, bookData) {
        try {
            const response = await this.bookApiService.update(id, bookData);
            if (response.success && response.data) {
                return Book.fromJson(response.data);
            }
            throw new Error(response.message || `Error desconocido al actualizar libro con ID ${id}.`);
        } catch (error) {
            console.error(`Error en BookRepository.updateBook(${id}):`, error);
            throw error;
        }
    }

    /**
     * Elimina un libro por su ID.
     * @param {number} id - El ID del libro a eliminar.
     * @returns {Promise<boolean>} Una promesa que resuelve a `true` si la eliminación fue exitosa.
     */
    async deleteBook(id) {
        try {
            const response = await this.bookApiService.delete(id);
            if (response.success) { // El 204 No Content se maneja en ApiService
                return true;
            }
            throw new Error(response.message || `Error desconocido al eliminar libro con ID ${id}.`);
        } catch (error) {
            console.error(`Error en BookRepository.deleteBook(${id}):`, error);
            throw error;
        }
    }
}