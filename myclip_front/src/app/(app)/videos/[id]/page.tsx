'use client';

import React, { useEffect, useState } from 'react';
import { VideoPlayer } from '../../../../components/VideoPlayer';
import api from '../../../../services/api.service';
import { useRouter, useParams } from 'next/navigation';

// Tipos para el video (solo los campos necesarios)
interface VideoDetails {
    video_id: string;
    title: string;
    status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
    streamUrlHls?: string;
}

export default function VideoDetailPage() {
    const router = useRouter();
    const params = useParams();
    const videoId = params.id as string;

    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Obtener los detalles del video del backend
    useEffect(() => {
        if (!videoId) return;

        api.get<VideoDetails>(`videos/${videoId}`)
            .then(response => {
                setVideo(response.data);
                
                // Si el video está activo, detenemos la carga.
                if (response.data.status === 'ACTIVE') {
                    setLoading(false);
                }
            })
            .catch(err => {
                setError("No se pudo cargar el video o las credenciales son inválidas.");
                setLoading(false);
            });
    }, [videoId]);

    // 2. Lógica de Polling para videos PENDING/PROCESSING
    useEffect(() => {
        if (!video || video.status === 'ACTIVE' || loading) return;

        const interval = setInterval(() => {
             console.log(`Polling para el video ${videoId}...`);
             
             // Volver a consultar solo el estado
             api.get<VideoDetails>(`videos/${videoId}`)
                 .then(response => {
                     setVideo(response.data);
                     if (response.data.status === 'ACTIVE') {
                         clearInterval(interval);
                         setLoading(false);
                     }
                 })
                 .catch(console.error);
        }, 5000); 

        return () => clearInterval(interval);
    }, [video, loading, videoId]);

    // --- 3. Renderizado de la UI ---

    if (loading) {
        return <div className="p-10 text-center">Cargando detalles del video...</div>;
    }

    if (error || !video) {
        return <div className="p-10 text-center text-red-600">Error: {error || "Video no encontrado."}</div>;
    }

    // 4. Manejo del estado PENDING/PROCESSING
    if (video.status !== 'ACTIVE') {
        return (
            <div className="p-10 text-center mt-20">
                <h1 className="text-3xl font-bold mb-4">Procesando Video</h1>
                <p className="text-gray-600">Tu videoclip está actualmente en la cola de transcodificación.</p>
                <p className="text-blue-500 mt-2 animate-pulse">Estado: **{video.status}** - Se actualizará automáticamente.</p>
            </div>
        );
    }

    // 5. Opciones del Reproductor (Solo si está ACTIVO)
    const playerOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                // Usamos la URL HLS simulada del backend
                src: video.streamUrlHls!, 
                type: 'application/x-mpegURL', // Tipo MIME para HLS
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                
                {/* 6. Renderizar el Reproductor */}
                <div className="bg-black rounded-xl shadow-2xl">
                    <VideoPlayer options={playerOptions} />
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold">Descripción:</h2>
                    <p className="text-gray-700">{video.description}</p>
                    <p className="mt-2 text-sm text-gray-500">URL HLS Simulada: {video.streamUrlHls}</p>
                </div>
            </div>
        </div>
    );
}