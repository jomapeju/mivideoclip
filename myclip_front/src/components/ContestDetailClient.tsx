// myclip_front/src/components/ContestDetailClient.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type {
  Contest,
  ContestVideoParticipant,
  Video,
} from '../lib/video.types';
import {
  voteInContest,
  submitVideoToContest,
} from '../services/contests.service';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';

type Props = {
  contest: Contest;
  initialRanking: ContestVideoParticipant[];
  isAuthenticated: boolean;
};

export default function ContestDetailClient({
  contest,
  initialRanking,
  isAuthenticated,
}: Props) {
  const router = useRouter();

  const [ranking, setRanking] =
    useState<ContestVideoParticipant[]>(initialRanking);
  const [loadingVote, setLoadingVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const [showEnroll, setShowEnroll] = useState(false);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loadingMyVideos, setLoadingMyVideos] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  const isActive = contest.status === 'ACTIVE';

  const participantVideoIds = useMemo(
    () => new Set(ranking.map((p) => p.videoId)),
    [ranking],
  );

  // ===========================
  //   VOTAR EN CONCURSO
  // ===========================
  async function handleVote(videoId: string) {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isActive) {
      setVoteError('Este concurso no está activo actualmente.');
      return;
    }

    setLoadingVote(true);
    setVoteError(null);

    try {
      const { participant } = await voteInContest(contest.contest_id, videoId);

      // Actualizamos ranking con el participante actualizado
      setRanking((prev) => {
        const others = prev.filter((p) => p.id !== participant.id);
        const updated = [...others, participant];
        // Ordenar por votos desc, luego fecha asc
        return updated.sort((a, b) => {
          if (b.contestVoteCount !== a.contestVoteCount) {
            return b.contestVoteCount - a.contestVoteCount;
          }
          return (
            new Date(a.submissionDate).getTime() -
            new Date(b.submissionDate).getTime()
          );
        });
      });
    } catch (err: any) {
      setVoteError(err.message || 'No se pudo registrar el voto.');
      // Si el mensaje indica que ya ha votado, podrías deshabilitar todos los botones.
    } finally {
      setLoadingVote(false);
    }
  }

  // ===========================
  //   CARGAR MIS VIDEOS
  // ===========================
  async function loadMyVideosOnce() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (myVideos.length > 0) {
      setShowEnroll(true);
      return;
    }

    setLoadingMyVideos(true);
    setEnrollError(null);

    try {
      const res = await api.get<Video[]>('/videos/mine');
      setMyVideos(res.data);
      setShowEnroll(true);
    } catch (err: any) {
      setEnrollError('No se pudieron cargar tus videos.');
    } finally {
      setLoadingMyVideos(false);
    }
  }

  // ===========================
  //   INSCRIBIR VIDEO
  // ===========================
  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError(null);
    setEnrollSuccess(null);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isActive) {
      setEnrollError('Este concurso no está activo.');
      return;
    }
    if (!selectedVideoId) {
      setEnrollError('Selecciona un video primero.');
      return;
    }
    if (participantVideoIds.has(selectedVideoId)) {
      setEnrollError('Este video ya está inscrito en el concurso.');
      return;
    }

    try {
      const participant = await submitVideoToContest(
        contest.contest_id,
        selectedVideoId,
      );

      // Añadimos al ranking y reordenamos
      setRanking((prev) => {
        const updated = [...prev, participant];
        return updated.sort((a, b) => {
          if (b.contestVoteCount !== a.contestVoteCount) {
            return b.contestVoteCount - a.contestVoteCount;
          }
          return (
            new Date(a.submissionDate).getTime() -
            new Date(b.submissionDate).getTime()
          );
        });
      });

      setEnrollSuccess('Video inscrito correctamente en el concurso.');
      setSelectedVideoId('');
    } catch (err: any) {
      setEnrollError(err.message || 'No se pudo inscribir el video.');
    }
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Info básica de fechas y estado */}
      <section className="p-4 bg-white rounded-md shadow flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Inicio:{" "}
              {new Date(contest.start_date).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="text-sm text-gray-500">
              Fin:{" "}
              {new Date(contest.end_date).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              contest.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : contest.status === "UPCOMING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {contest.status}
          </span>
        </div>

        {/* Mensajes según estado */}
        {contest.status === "UPCOMING" && (
          <p className="text-blue-600 text-sm">
            ⚠️ Este concurso aún no ha comenzado. Podrás votar e inscribir videos una
            vez esté activo.
          </p>
        )}

        {contest.status === "ACTIVE" && (
          <p className="text-green-700 text-sm font-semibold">
            🟢 ¡Concurso activo! Puedes votar e inscribir tus videos.
          </p>
        )}

        {contest.status === "CLOSED" && (
          <p className="text-gray-500 text-sm">
            ⛔ Este concurso ya ha finalizado. No se permiten nuevas inscripciones ni
            votos.
          </p>
        )}
      </section>


      {/* Mensaje de error de voto */}
      {voteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {voteError}
        </p>
      )}

      {/* Ranking */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ranking</h2>
        {ranking.length === 0 ? (
          <p className="text-gray-500">Aún no hay videos inscritos.</p>
        ) : (
          <ul className="space-y-3">
            {ranking.map((p, index) => (
              <li
                key={p.id}
                className="flex justify-between items-center bg-white shadow-sm rounded-md p-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-600 w-8 text-center">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {p.video?.title || 'Video sin título'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Canción: {p.video?.songTitle || '-'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Votos en este concurso: {p.contestVoteCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleVote(p.videoId)}
                  disabled={loadingVote || !isActive}
                  className={`px-4 py-2 rounded text-white font-semibold ${
                    !isActive
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loadingVote ? 'Votando...' : 'Votar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Inscribir video */}
      <section className="mt-8 p-4 bg-white rounded-md shadow space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inscribir un video</h2>
          <button
            onClick={loadMyVideosOnce}
            className="text-sm text-blue-600 underline"
          >
            {showEnroll ? 'Cambiar selección' : 'Elegir de mis videos'}
          </button>
        </div>

        {!isAuthenticated && (
          <p className="text-gray-500">
            Debes{' '}
            <a href="/login" className="text-blue-600 underline">
              iniciar sesión
            </a>{' '}
            para inscribir un video.
          </p>
        )}

        {loadingMyVideos && <p>Cargando tus videos...</p>}

        {isAuthenticated && showEnroll && (
          <form onSubmit={handleEnroll} className="space-y-3">
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Selecciona un video:
              </label>
              <select
                value={selectedVideoId}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Elige uno de tus videos --</option>
                {myVideos.map((v) => (
                  <option
                    key={v.video_id}
                    value={v.video_id}
                    disabled={participantVideoIds.has(v.video_id)}
                  >
                    {v.title} {participantVideoIds.has(v.video_id) ? ' (ya inscrito)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {enrollError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                {enrollError}
              </p>
            )}
            {enrollSuccess && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded">
                {enrollSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={!isActive}
              className={`px-4 py-2 rounded text-white font-semibold ${
                !isActive
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Inscribir video
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
