import api from './api.service'; // Tu instancia de Axios con el interceptor JWT
import { Video, VoteResponse } from '../lib/video.types';
import axios from 'axios';

// --- (Función de Obtención de Detalles del Video - Necesaria para la página) ---

export const getVideoById = async (videoId: string): Promise<Video> => {
    try {
        const response = await api.get<Video>(`videos/${videoId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error('Video no encontrado.');
        }
        throw new Error('Error al cargar los detalles del video.');
    }
};


// --- (Función de Votación) ---

export const registerVote = async (videoId: string): Promise<Video> => {
    try {
        // La instancia 'api' ya se encarga de adjuntar el token JWT.
        const response = await api.post<VoteResponse>(
            `videos/${videoId}/vote`,
            {}, // Body vacío
        );
        
        return response.data.video; // Devuelve el objeto Video actualizado
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            throw new Error('Ya has votado por este video.');
        }
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error desconocido al registrar el voto.');
    }
};