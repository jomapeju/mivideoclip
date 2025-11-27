'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api.service';
import type { Video } from '../../../lib/video.types';

// Ranking Usuarios
interface UserRanking {
  user_id: string;
  username: string;
  reputationScore: number;
  createdAt: string;
}

export default function RankingsPage() {
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================
  //   FETCH DATA
  // ============================
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [videosRes, usersRes] = await Promise.all([
        api.get<Video[]>('/videos/popular?limit=10'),
        api.get<UserRanking[]>('/users/ranking?limit=10'),
      ]);

      setPopularVideos(videosRes.data);
      setUserRanking(usersRes.data);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError('No se pudieron cargar las clasificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // ============================
  //   RANKING CARD COMPONENT
  // ============================
  const RankingCard = ({
    title,
    data,
    valueKey,
    labelKey,
    accent = "indigo",
  }: {
    title: string;
    data: any[];
    valueKey: string;
    labelKey: string;
    accent?: "indigo" | "emerald";
  }) => (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/70 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        {title}
        <span className="text-lg">🏆</span>
      </h2>

      {data.length === 0 ? (
        <p className="text-slate-400">No hay datos para mostrar.</p>
      ) : (
        <ol className="space-y-3">
          {data.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between border-b border-slate-800 pb-2"
            >
              <span className="text-slate-200 font-medium text-sm">
                <span className="text-slate-500 mr-2">#{idx + 1}</span>
                {item[labelKey]}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold bg-${accent}-600/10 text-${accent}-400 border border-${accent}-700/40`}
              >
                {item[valueKey]}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  // ============================
  //   UI STATES
  // ============================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Cargando clasificaciones...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl">
        {error}
      </div>
    );

  // ============================
  //   MAIN RENDER
  // ============================
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-center text-4xl font-extrabold text-white tracking-tight">
          Rankings Globales
        </h1>

        <p className="text-center text-slate-400 max-w-xl mx-auto">
          Clasificación basada en los vídeos más votados y los usuarios con mayor reputación.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <RankingCard
            title="Videos Más Votados"
            data={popularVideos}
            valueKey="voteCount"
            labelKey="title"
            accent="indigo"
          />

          <RankingCard
            title="Usuarios con Mayor Reputación"
            data={userRanking}
            valueKey="reputationScore"
            labelKey="username"
            accent="emerald"
          />

        </div>

      </div>
    </div>
  );
}
