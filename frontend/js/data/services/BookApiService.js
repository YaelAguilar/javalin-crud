// frontend/js/data/services/BookApiService.js

import { API_BASE_URL } from '../../config/apiConfig.js';

/**
 * @class BookApiService
 * @description Cliente HTTP directo para la API de libros.
 * Encapsula la lógica de las peticiones Fetch y manejo de respuestas HTTP.
 */
export class BookApiService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/books`; // URL específica para el recurso de libros
    }

    /**
     * Realiza una petición genérica a la API.
     * @param {string} endpoint - El endpoint específico (ej. '/123', o vacío para listar/crear).
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE).
     * @param {object} [body=null] - El cuerpo de la petición para POST/PUT.
     * @returns {Promise<object>} La respuesta JSON de la API.
     * @throws {Error} Si la petición HTTP no es exitosa (status fuera de 2xx).
     */
    async request(endpoint = '', method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);

            // Si la respuesta es 204 No Content (DELETE exitoso), no hay body
            if (response.status === 204) {
                return { success: true, message: 'Operación exitosa (No Content)' };
            }

            const responseData = await response.json();

            if (!response.ok) {
                // Si la respuesta no es OK (ej. 400, 404, 500), lanzamos un error
                // El cuerpo JSON del error debe tener 'message' y 'success'.
                const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return responseData; // Devolvemos el JSON de la respuesta exitosa
        } catch (error) {
            console.error(`Error en la petición ${method} ${url}:`, error);
            // Relanzamos el error para que sea manejado por la capa superior (Repository)
            throw error; 
        }
    }

    // Métodos específicos para cada operación CRUD
    async getAll() {
        return this.request('', 'GET');
    }

    async getById(id) {
        return this.request(`/${id}`, 'GET');
    }

    async create(bookData) {
        return this.request('', 'POST', bookData);
    }

    async update(id, bookData) {
        return this.request(`/${id}`, 'PUT', bookData);
    }

    async delete(id) {
        return this.request(`/${id}`, 'DELETE');
    }
}