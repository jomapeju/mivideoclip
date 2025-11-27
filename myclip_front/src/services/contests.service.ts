// myclip_front/src/services/contests.service.ts
import api from './api.service';
import type { Contest, ContestVideoParticipant } from '../lib/video.types';
import axios from 'axios';

// Obtener detalle de concurso (CLIENTE)
export async function getContestById(contestId: string): Promise<Contest> {
  const res = await api.get<Contest>(`/contests/${contestId}`);
  return res.data;
}

// Obtener ranking / participantes del concurso
export async function getContestRanking(
  contestId: string,
): Promise<ContestVideoParticipant[]> {
  const res = await api.get<ContestVideoParticipant[]>(
    `/contests/${contestId}/ranking`,
  );
  return res.data;
}

// Inscribir vídeo a concurso
export async function submitVideoToContest(
  contestId: string,
  videoId: string,
): Promise<ContestVideoParticipant> {
  const res = await api.post<ContestVideoParticipant>(
    `/contests/${contestId}/submit`,
    { videoId },
  );
  return res.data;
}

// Votar en un concurso
export async function voteInContest(
  contestId: string,
  videoId: string,
): Promise<{ message: string; participant: ContestVideoParticipant }> {
  try {
    const res = await api.post<{ message: string; participant: ContestVideoParticipant }>(
      `/contests/${contestId}/vote`,
      { videoId },
    );
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Error al votar en el concurso.');
  }
}
