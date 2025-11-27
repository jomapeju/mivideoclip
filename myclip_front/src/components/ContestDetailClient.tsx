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

import {
  TrophyIcon,
  ArrowRightCircleIcon,
  FilmIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

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

  const [ranking, setRanking] = useState<ContestVideoParticipant[]>(initialRanking);
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
    [ranking]
  );

  // =====================================================================
  // 📌 VOTAR
  // =====================================================================
  async function handleVote(videoId: string) {
    if (!isAuthenticated) return router.push('/login');
    if (!isActive) {
      setVoteError('Este concurso no está activo actualmente.');
      return;
    }

    setLoadingVote(true);
    setVoteError(null);

    try {
      const { participant } = await voteInContest(contest.contest_id, videoId);

      // Reordenar ranking tras vote
      setRanking((prev) => {
        const others = prev.filter((p) => p.id !== participant.id);
        const updated = [...others, participant];

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
    } finally {
      setLoadingVote(false);
    }
  }

  // =====================================================================
  // 📌 CARGAR MIS VIDEOS (solo la primera vez que clican "Elegir video")
  // =====================================================================
  async function loadMyVideosOnce() {
    if (!isAuthenticated) return router.push('/login');

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
    } catch {
      setEnrollError('No se pudieron cargar tus videos.');
    } finally {
      setLoadingMyVideos(false);
    }
  }

  // =====================================================================
  // 📌 INSCRIBIR VIDEO
  // =====================================================================
  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError(null);
    setEnrollSuccess(null);

    if (!isAuthenticated) return router.push('/login');
    if (!isActive) return setEnrollError('Este concurso no está activo.');
    if (!selectedVideoId) return setEnrollError('Selecciona un video primero.');
    if (participantVideoIds.has(selectedVideoId))
      return setEnrollError('Este video ya está inscrito.');

    try {
      const participant = await submitVideoToContest(
        contest.contest_id,
        selectedVideoId
      );

      setRanking((prev) => {
        const updated = [...prev, participant];
        return updated.sort((a, b) => {
          if (b.contestVoteCount !== a.contestVoteCount)
            return b.contestVoteCount - a.contestVoteCount;

          return (
            new Date(a.submissionDate).getTime() -
            new Date(b.submissionDate).getTime()
          );
        });
      });

      setEnrollSuccess('🎉 Video inscrito correctamente.');
      setSelectedVideoId('');
    } catch (err: any) {
      setEnrollError(err.message || 'No se pudo inscribir el video.');
    }
  }

  // =====================================================================
  // ⭐ BADGE DE ESTADO
  // =====================================================================
  const statusBadge = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    UPCOMING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CLOSED: 'bg-gray-200 text-gray-700 border-gray-400',
  }[contest.status];

  return (
    <div className="space-y-10 mt-6 max-w-4xl mx-auto">

      {/* ================================================================= */}
      {/* 🏁 CABECERA DEL CONCURSO */}
      {/* ================================================================= */}
      <section className="p-6 bg-white rounded-2xl shadow-md border space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrophyIcon className="h-7 w-7 text-yellow-500" /> {contest.title}
          </h2>

          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusBadge}`}
          >
            {contest.status}
          </span>
        </div>

        <p className="text-gray-600 leading-relaxed">{contest.description}</p>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <p>
            🕒 Inicio:{' '}
            <strong>
              {new Date(contest.start_date).toLocaleString('es-ES')}
            </strong>
          </p>
          <p>
            ⏳ Fin:{' '}
            <strong>{new Date(contest.end_date).toLocaleString('es-ES')}</strong>
          </p>
        </div>

        {contest.status === 'UPCOMING' && (
          <p className="text-blue-600 text-sm">
            ⚠️ El concurso aún no ha comenzado.
          </p>
        )}
        {contest.status === 'ACTIVE' && (
          <p className="text-green-700 text-sm font-semibold">
            🟢 ¡Concurso activo! Puedes votar o inscribir videos.
          </p>
        )}
        {contest.status === 'CLOSED' && (
          <p className="text-gray-500 text-sm">⛔ Concurso finalizado.</p>
        )}
      </section>

      {/* ================================================================= */}
      {/* ⚠️ MENSAJE DE ERROR DE VOTO */}
      {/* ================================================================= */}
      {voteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {voteError}
        </p>
      )}

      {/* ================================================================= */}
      {/* 🏆 RANKING */}
      {/* ================================================================= */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowRightCircleIcon className="h-6 w-6 text-blue-600" />
          Ranking de participantes
        </h3>

        {ranking.length === 0 ? (
          <p className="text-gray-500">No hay videos inscritos aún.</p>
        ) : (
          <ul className="space-y-3">
            {ranking.map((p, index) => (
              <li
                key={p.id}
                className="flex justify-between items-center bg-white shadow-sm rounded-lg p-4 border"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-700 w-8 text-center">
                    #{index + 1}
                  </span>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {p.video?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Canción: {p.video?.songTitle || '-'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Votos: {p.contestVoteCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleVote(p.videoId)}
                  disabled={loadingVote || !isActive}
                  className={`px-4 py-2 rounded text-white font-semibold transition ${
                    !isActive
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loadingVote ? 'Votando…' : 'Votar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ================================================================= */}
      {/* 🎬 INSCRIBIR VIDEO */}
      {/* ================================================================= */}
      <section className="p-6 bg-white rounded-2xl shadow space-y-4 border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FilmIcon className="h-6 w-6 text-purple-500" />
            Inscribir un video
          </h2>

          <button
            onClick={loadMyVideosOnce}
            className="text-sm text-blue-600 underline hover:text-blue-700"
          >
            {showEnroll ? 'Cambiar selección' : 'Elegir de mis videos'}
          </button>
        </div>

        {!isAuthenticated && (
          <p className="text-gray-600">
            Necesitas{' '}
            <a href="/login" className="text-blue-600 underline">
              iniciar sesión
            </a>{' '}
            para inscribir tus videos.
          </p>
        )}

        {loadingMyVideos && <p>Cargando tus videos...</p>}

        {isAuthenticated && showEnroll && (
          <form className="space-y-4" onSubmit={handleEnroll}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona un video:
              </label>

              <select
                value={selectedVideoId}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">-- Elige un video --</option>

                {myVideos.map((v) => (
                  <option
                    key={v.video_id}
                    value={v.video_id}
                    disabled={participantVideoIds.has(v.video_id)}
                  >
                    {v.title}{' '}
                    {participantVideoIds.has(v.video_id) ? ' (ya inscrito)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {enrollError && (
              <p className="text-red-600 bg-red-100 border border-red-200 p-2 rounded text-sm flex items-center gap-2">
                <XCircleIcon className="h-4 w-4" />
                {enrollError}
              </p>
            )}

            {enrollSuccess && (
              <p className="text-green-700 bg-green-100 border border-green-200 p-2 rounded text-sm flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                {enrollSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={!isActive}
              className={`px-4 py-2 rounded text-white font-semibold transition ${
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
