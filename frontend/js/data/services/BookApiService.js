import { API_BASE_URL } from '../../config/apiConfig.js';

/**
 * @class BookApiService
 * @description Cliente HTTP directo para la API de libros.
 * Encapsula la lógica de las peticiones Fetch y manejo de respuestas HTTP.
 */
export class BookApiService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/books`;
    }

    /**
     * Realiza una petición genérica a la API.
     * @param {string} endpoint - El endpoint específico.
     * @param {string} method - El método HTTP.
     * @param {object} [body=null] - El cuerpo de la petición.
     * @returns {Promise<object>} La respuesta JSON de la API.
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

            // Si la respuesta es 204 No Content (DELETE exitoso)
            if (response.status === 204) {
                return { success: true, message: 'Operación exitosa (No Content)' };
            }

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error(`Error en la petición ${method} ${url}:`, error);
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