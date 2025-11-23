'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';

interface Video {
  video_id: string;
  title: string;
  songTitle: string;
  status: 'PENDING' | 'PROCESSING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  streamUrlHls?: string;
}

export const VideoList = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👉 Cargar una sola vez
  const fetchVideos = useCallback(async () => {
    try {
      const response = await api.get<Video[]>('videos/mine');
      setVideos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar videos:', err);
      setError('No se pudieron cargar los videos. Intente iniciar sesión nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 👉 Solo una llamada al montar
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const StatusBadge = ({ status }: { status: Video['status'] }) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800 animate-pulse',
      ACTIVE: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <p className="text-center mt-8 text-lg">Cargando tus videos...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (videos.length === 0) return <p className="text-center mt-8 text-gray-500">Aún no has subido ningún videoclip. ¡Sube uno ahora!</p>;

  return (
    <div className="space-y-6">
      {videos.map(video => (
        <div key={video.video_id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-white">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-600">Canción: {video.songTitle}</p>
            <p className="text-xs text-gray-400 mt-1">Subido: {new Date(video.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-4">
            <StatusBadge status={video.status} />
            {video.status === 'ACTIVE' && (
              <button
                onClick={() => router.push(`/videos/${video.video_id}`)}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
              >
                Reproducir
              </button>
            )}
            {(video.status === 'PENDING' || video.status === 'PROCESSING') && (
              <span className="text-sm text-blue-500">Procesando...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
