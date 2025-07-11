// frontend/js/core/Book.js

/**
 * @class Book
 * @description Representa la entidad de dominio pura de un libro.
 * Es inmutable y no contiene lógica de negocio compleja ni dependencias de UI/API.
 */
export class Book {
    /**
     * @param {number} id - El ID único del libro.
     * @param {string} title - El título del libro.
     * @param {string} author - El autor del libro.
     * @param {number} publicationYear - El año de publicación del libro.
     * @param {string} isbn - El ISBN del libro.
     * @param {string} createdAt - La fecha y hora de creación del registro.
     * @param {string} updatedAt - La fecha y hora de la última actualización del registro.
     */
    constructor(id, title, author, publicationYear, isbn, createdAt, updatedAt) {
        if (typeof id !== 'number' || id < 0) {
            throw new Error('Book: ID debe ser un número positivo.');
        }
        if (typeof title !== 'string' || title.trim() === '') {
            throw new Error('Book: Título es obligatorio.');
        }
        if (typeof author !== 'string' || author.trim() === '') {
            throw new Error('Book: Autor es obligatorio.');
        }
        if (typeof publicationYear !== 'number' || publicationYear <= 0) {
            throw new Error('Book: Año de publicación debe ser un número positivo.');
        }
        if (typeof isbn !== 'string' || isbn.trim() === '') {
            throw new Error('Book: ISBN es obligatorio.');
        }

        this._id = id;
        this._title = title.trim();
        this._author = author.trim();
        this._publicationYear = publicationYear;
        this._isbn = isbn.trim();
        this._createdAt = createdAt; // Convertir a Date si fuera necesario para operaciones de fecha
        this._updatedAt = updatedAt; // Convertir a Date si fuera necesario para operaciones de fecha
    }

    // Getters para acceder a las propiedades (las hacemos "getters" para simular inmutabilidad una vez creado)
    get id() { return this._id; }
    get title() { return this._title; }
    get author() { return this._author; }
    get publicationYear() { return this._publicationYear; }
    get isbn() { return this._isbn; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }

    /**
     * Crea una instancia de Book a partir de un objeto JSON (típicamente de la API).
     * Esto actúa como un "factory method" o "constructor secundario".
     * @param {object} data - Objeto JSON con los datos del libro.
     * @returns {Book} Una nueva instancia de Book.
     */
    static fromJson(data) {
        if (!data || typeof data.id === 'undefined') { // `id` puede ser 0
            throw new Error('Book.fromJson: Datos JSON inválidos o incompletos para crear un libro.');
        }
        return new Book(
            data.id,
            data.title,
            data.author,
            data.publicationYear,
            data.isbn,
            data.createdAt,
            data.updatedAt
        );
    }
}