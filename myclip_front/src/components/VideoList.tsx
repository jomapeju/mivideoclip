'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';

// 1. Tipos para el video (deben coincidir con la entidad de NestJS)
interface Video {
  video_id: string;
  title: string;
  songTitle: string;
  status: 'PENDING' | 'PROCESSING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  streamUrlHls?: string; // Solo disponible si status es ACTIVE
}

// 2. Tiempos de Polling
const POLLING_INTERVAL = 5000; // Consultar cada 5 segundos

export const VideoList = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la lista de videos del usuario
  const fetchVideos = useCallback(async () => {
    try {
      // Ruta protegida que lista los videos del usuario
      const response = await api.get<Video[]>('videos');
      setVideos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar videos:', err);
      // Asumimos que el interceptor de Axios redirige si hay 401
      setError('No se pudieron cargar los videos. Intente iniciar sesión nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Lógica del Polling (useEffect)
  useEffect(() => {
    fetchVideos(); // Primera carga inmediata

    // Configurar el intervalo de polling
    const interval = setInterval(() => {
      // Solo hacemos polling si hay videos en estado PENDING o PROCESSING
      const needsPolling = videos.some(v => v.status === 'PENDING' || v.status === 'PROCESSING');
      if (needsPolling || loading) {
          fetchVideos();
      }
    }, POLLING_INTERVAL);

    // Limpiar el intervalo al desmontar el componente (CRUCIAL para evitar fugas de memoria)
    return () => clearInterval(interval);
  }, [fetchVideos, loading, videos]); // Dependencias del useEffect

  // 4. Componente Visual de Estado
  const StatusBadge = ({ status }: { status: Video['status'] }) => {
    const classes = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800 animate-pulse',
      'ACTIVE': 'bg-green-100 text-green-800',
      'BLOCKED': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) return <p className="text-center mt-8 text-lg">Cargando tus videos...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (videos.length === 0) return <p className="text-center mt-8 text-gray-500">Aún no has subido ningún videoclip. ¡Sube uno ahora!</p>;

  // 5. Renderizado de la Lista
  return (
    <div className="space-y-6">
      {videos.map((video) => (
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