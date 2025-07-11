/**
 * @class Book
 * @description Representa la entidad de dominio pura de un libro.
 */
export class Book {
    /**
     * @param {number} id - El ID único del libro.
     * @param {string} title - El título del libro.
     * @param {string} author - El autor del libro.
     * @param {number} publicationYear - El año de publicación del libro.
     * @param {string} isbn - El ISBN del libro.
     * @param {Array<number>} createdAtArray - La fecha y hora de creación como array.
     * @param {Array<number>} updatedAtArray - La fecha y hora de la última actualización como array.
     */
    constructor(id, title, author, publicationYear, isbn, createdAtArray, updatedAtArray) {
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

        // Convertir el array de fecha a una cadena ISO 8601 válida
        this._createdAt = createdAtArray ? this._formatDateArrayToISO(createdAtArray) : null;
        this._updatedAt = updatedAtArray ? this._formatDateArrayToISO(updatedAtArray) : null;
    }

    // Getters para acceder a las propiedades
    get id() { return this._id; }
    get title() { return this._title; }
    get author() { return this._author; }
    get publicationYear() { return this._publicationYear; }
    get isbn() { return this._isbn; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }

    /**
     * Crea una instancia de Book a partir de un objeto JSON.
     * @param {object} data - Objeto JSON con los datos del libro.
     * @returns {Book} Una nueva instancia de Book.
     */
    static fromJson(data) {
        if (!data || typeof data.id === 'undefined') {
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

    /**
     * Método privado para formatear un array de fecha a una cadena ISO 8601.
     * @param {Array<number>} dateArray - Array de componentes de fecha.
     * @returns {string} Cadena de fecha en formato ISO 8601.
     */
    _formatDateArrayToISO(dateArray) {
        const year = dateArray[0];
        const month = String(dateArray[1]).padStart(2, '0');
        const day = String(dateArray[2]).padStart(2, '0');
        const hour = String(dateArray[3]).padStart(2, '0');
        const minute = String(dateArray[4]).padStart(2, '0');
        const second = String(dateArray[5]).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }
}