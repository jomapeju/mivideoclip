'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';
import {
  PlayCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { updateVideoVisibility } from '../services/videos.service';

interface Video {
  video_id: string;
  title: string;
  songTitle: string;
  status: 'PENDING' | 'PROCESSING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  thumbnailUrl?: string;
  streamUrlHls?: string;
  visibility?: "PUBLIC" | "PRIVATE";

}

export const VideoList = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Fetch videos del usuario
  const fetchVideos = useCallback(async () => {
    try {
      const response = await api.get<Video[]>('videos/mine');
      setVideos(response.data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los videos. Intente iniciar sesión nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // 🎨 Badge de estado
  const StatusBadge = ({ status }: { status: Video['status'] }) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
      ACTIVE: 'bg-green-100 text-green-800 border-green-300',
      BLOCKED: 'bg-red-100 text-red-800 border-red-300',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };
  

  // 🕒 Loading
  if (loading)
    return (
      <p className="text-center mt-8 text-gray-600 flex items-center justify-center gap-2">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        Cargando tus videos...
      </p>
    );

  // ❌ Error
  if (error)
    return (
      <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>
    );

  // 📭 No videos
  if (videos.length === 0)
    return (
      <p className="text-center mt-8 text-gray-500 italic">
        Aún no has subido ningún videoclip. ¡Sube uno ahora!
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      {videos.map((video) => (
        <div
          key={video.video_id}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
        >
          {/* THUMBNAIL */}
          <div className="relative h-44 bg-gray-200">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sin miniatura
              </div>
            )}

            {/* STATUS BADGE sobre thumbnail */}
            <div className="absolute top-2 left-2">
              <StatusBadge status={video.status} />
            </div>
            <div className="absolute top-2 right-2">
              <span className={`
                px-2 py-1 text-xs font-semibold rounded-full border 
                ${video.visibility === "PUBLIC"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-300 text-gray-800 border-gray-400"}
              `}>
                {video.visibility === "PUBLIC" ? "Público" : "Privado"}
              </span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {video.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              Canción: {video.songTitle}
            </p>

            <p className="text-xs text-gray-400">
              Subido el {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">

            {video.status === 'ACTIVE' ? (
              <button
                onClick={() => router.push(`/videos/${video.video_id}`)}
                className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                <PlayCircleIcon className="w-5 h-5" />
                Reproducir
              </button>
            ) : video.status === 'PROCESSING' ? (
              <span className="flex items-center gap-1 text-blue-600 text-sm">
                <ClockIcon className="w-5 h-5 animate-pulse" />
                Procesando...
              </span>
            ) : video.status === 'PENDING' ? (
              <span className="flex items-center gap-1 text-yellow-700 text-sm">
                <ClockIcon className="w-5 h-5" /> En cola...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <XCircleIcon className="w-5 h-5" />
                Bloqueado
              </span>
            )}

            <button
              onClick={async () => {
                try {
                  const newVisibility =
                    video.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";

                  await updateVideoVisibility(video.video_id, newVisibility);

                  setVideos((prev) =>
                    prev.map((v) =>
                      v.video_id === video.video_id ? { ...v, visibility: newVisibility } : v
                    )
                  );
                } catch {
                  alert("No se pudo actualizar la privacidad.");
                }
              }}
              className="text-sm px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 text-gray-900"
            >
              {video.visibility === "PUBLIC" ? "Hacer Privado" : "Hacer Público"}
            </button>
          </div>
        </div>
      ))}

    </div>
  );
};
