'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { VideoPlayer } from '../../../../components/VideoPlayer'; // Asegúrate de que esta ruta sea correcta
import { registerVote, getVideoById } from '../../../../services/videos.service'; // NUEVO SERVICIO
import { Video } from '../../../../lib/video.types'; // NUEVO TIPO
import { useParams } from 'next/navigation';

const POLLING_INTERVAL = 5000;

export default function VideoDetailPage() {
    const params = useParams();
    const videoId = params.id as string;

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVoted, setIsVoted] = useState(false);
    const [isLoadingVote, setIsLoadingVote] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función principal para obtener el video y su estado
    const fetchVideoDetails = useCallback(async () => {
        if (!videoId) return;

        try {
            const data = await getVideoById(videoId);
            setVideo(data);
            
            // Si el video está activo, detenemos la carga inicial
            if (data.status === 'ACTIVE') {
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "Error al cargar el video.");
            setLoading(false);
        }
    }, [videoId]);

    // Polling para el estado PENDING/PROCESSING
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (videoId && (!video || video.status !== 'ACTIVE')) {
            // Iniciar polling solo si es necesario
            interval = setInterval(fetchVideoDetails, POLLING_INTERVAL);
        } else if (video && video.status === 'ACTIVE') {
            setLoading(false);
        }

        fetchVideoDetails(); // Carga inicial
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [videoId, video?.status, fetchVideoDetails]); // Dependencias para el polling

    // Lógica de Votación
    const handleVote = async () => {
        if (!video || isVoted || isLoadingVote) return;
        
        setIsLoadingVote(true);
        setError(null);

        try {
            const updatedVideo = await registerVote(video.video_id);
            
            // Actualizar el video en el estado local con los nuevos datos
            setVideo(updatedVideo); 
            setIsVoted(true); // Bloquear el botón
        } catch (err: any) {
            const errorMessage = err.message || 'Error desconocido al votar.';
            setError(errorMessage);
            // Si el error es 'Ya has votado', lo bloqueamos permanentemente
            if (errorMessage.includes('Ya has votado')) {
               setIsVoted(true);
            }
        } finally {
            setIsLoadingVote(false);
        }
    };


    // --- Renderizado de la UI ---

    if (loading) return <div className="p-10 text-center">Cargando detalles del video...</div>;
    if (error || !video) return <div className="p-10 text-center text-red-600">Error: {error || "Video no encontrado."}</div>;

    if (video.status !== 'ACTIVE') {
        // ... (UI de Procesando Video) ...
        return (
            <div className="p-10 text-center mt-20">
                <h1 className="text-3xl font-bold mb-4">Procesando Video</h1>
                <p className="text-gray-600">Tu videoclip está actualmente en la cola de transcodificación.</p>
                <p className="text-blue-500 mt-2 animate-pulse">Estado: **{video.status}** - Se actualizará automáticamente.</p>
            </div>
        );
    }

    // Opciones del Reproductor
    const playerOptions = {
        // ... (opciones del reproductor existentes)
        sources: [
            {
                // Usamos la URL HLS simulada
                src: video.streamUrlHls!, 
                type: 'application/x-mpegURL', 
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                
                <div className="bg-black rounded-xl shadow-2xl">
                    <VideoPlayer options={playerOptions} />
                </div>
                
                {/* --- SECCIÓN DE VOTACIÓN --- */}
                <div className="mt-6 p-4 bg-white rounded-lg shadow flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Votos: {video.voteCount}</h2>
                    </div>
                    
                    <button 
                        onClick={handleVote}
                        disabled={isVoted || isLoadingVote}
                        className="px-6 py-2 rounded-lg text-white font-semibold transition duration-150"
                        style={{ 
                            backgroundColor: isVoted ? '#ccc' : '#22c55e', // Verde esmeralda
                            cursor: isVoted ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoadingVote ? 'Votando...' : isVoted ? '👍 ¡Votado!' : '⭐ Votar'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}

                {/* --- DETALLES --- */}
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold">Descripción:</h2>
                    <p className="text-gray-700">{video.description}</p>
                </div>
            </div>
        </div>
    );
}