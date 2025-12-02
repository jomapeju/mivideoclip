import api from './api.service'; // Tu instancia de Axios con el interceptor JWT
import { Video, VoteResponse, Comment } from '../lib/video.types';
import axios from 'axios';

// --- (Función de Obtención de Detalles del Video - Necesaria para la página) ---
export const getVideoById = async (videoId: string): Promise<Video> => {
    try {
        const response = await api.get<Video>(`/videos/${videoId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error('Video no encontrado.');
        }
        throw new Error('Error al cargar los detalles del video.');
    }
};

// --- (Función de Obtención de Comentarios) ---

export const getCommentsByVideoId = async (videoId: string): Promise<Comment[]> => {
    try {
        const response = await api.get<Comment[]>(`/videos/${videoId}/comments`);
        return response.data;
    } catch (error) {
        throw new Error('Error al cargar los comentarios.');
    }
};

export const getVideoByIdServer = async (videoId: string) => {
  // utilidad server (no usada aquí porque SSR usa fetch), pero la dejamos para coherencia
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/${videoId}`);
  if (!res.ok) throw new Error('Video no encontrado');
  return res.json();
};

export const getRecommended = async (limit = 6) => {
  const res = await api.get<Video[]>(`/videos/popular?limit=${limit}`);
  return res.data;
};

export const registerVote = async (videoId: string) => {
  
    try {
        const res = await api.post(`/videos/${videoId}/vote`, {}, { withCredentials: true });
        return res.data;
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

export const createComment = async (videoId: string, content: string) => {
  try {
    const res = await api.post<Comment>(`/videos/${videoId}/comments`, { content }, { withCredentials: true });
    return res.data;
  } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Error desconocido al publicar el comentario.');
    }
};

export const updateVideoVisibility = async (videoId: string, visibility: "PUBLIC" | "PRIVATE") => {
  try {
    const res = await api.put(`/videos/${videoId}/visibility`, { visibility });
    return res.data;
  } catch (error) {
    throw new Error("No se pudo actualizar la privacidad del video.");
  }
};
