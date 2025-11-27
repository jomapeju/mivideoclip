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

export interface UserBasic {
    user_id: string;
    username: string;
    // ... otros campos básicos
}

export interface Comment {
    comment_id: string;
    userId: string;
    videoId: string;
    content: string;
    createdAt: string;
    user: UserBasic; // El backend nos devuelve el objeto user
}

export interface Category {
    category_id: string;
    name: string;
    icon_url?: string | null;
    createdAt: string;   // Los timestamps normalmente llegan como string ISO
    updatedAt: string;
}

export type ContestStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export interface Contest {
  contest_id: string;
  title: string;
  description: string;
  start_date: string;  // la API devuelve Date → en JSON será string
  end_date: string;
  status: ContestStatus;
  created_at: string;
}

export interface ContestVideoParticipant {
  id: string;
  contestId: string;
  videoId: string;
  contestVoteCount: number;
  submissionDate: string;
  video: Video; // reutilizamos tu tipo Video
}