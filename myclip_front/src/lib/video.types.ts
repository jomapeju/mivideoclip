// Define los campos esenciales que recibimos del backend
export interface Video {
  video_id: string;
  title: string;
  description: string;
  songTitle: string;
  streamUrlHls?: string;
  thumbnailUrl?: string;
  viewsCount: number;
  voteCount: number; // Campo del sistema de votación
  status: 'PENDING' | 'PROCESSING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

// Interfaz para la respuesta del backend al votar
export interface VoteResponse {
  message: string;
  video: Video;
}