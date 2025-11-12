'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { VideoPlayer } from '../../../../components/VideoPlayer'; // Asegúrate de que esta ruta sea correcta
import { registerVote, getVideoById, getCommentsByVideoId, createComment } from '../../../../services/videos.service'; // NUEVO SERVICIO
import { Video, Comment } from '../../../../lib/video.types'; // NUEVO TIPO
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie'; // <-- Para verificar la autenticación

const POLLING_INTERVAL = 5000;

export default function VideoDetailPage() {
    const params = useParams();
    const videoId = params.id as string;

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVoted, setIsVoted] = useState(false);
    const [isLoadingVote, setIsLoadingVote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const isAuthenticated = !!Cookies.get('auth_token');

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


    // Función para recargar la lista de comentarios
    const loadComments = useCallback(async () => {
        if (videoId) {
            try {
                const data = await getCommentsByVideoId(videoId);
                setComments(data);
            } catch (error) {
                console.error('Fallo al cargar comentarios:', error);
            }
        }
    }, [videoId]);

    // Cargar comentarios al inicio
    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isPosting || !isAuthenticated) return;

        setIsPosting(true);
        try {
            // Llama a la API para crear el comentario
            await createComment(videoId, newComment);
            
            setNewComment('');
            await loadComments(); // Recargar la lista
            
        } catch (error) {
            alert("Fallo al publicar el comentario.");
        } finally {
            setIsPosting(false);
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

                {/* ======================================================= */}
                {/* === SECCIÓN DE COMENTARIOS === */}
                {/* ======================================================= */}
                <div className="mt-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Comentarios ({comments.length})</h2>

                    {/* 1. Formulario de Comentarios */}
                    <div className="mb-6">
                        {isAuthenticated ? (
                            <form onSubmit={handlePostComment}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escribe tu comentario..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 mb-2"
                                    maxLength={500}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isPosting}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isPosting ? 'Publicando...' : 'Publicar Comentario'}
                                </button>
                            </form>
                        ) : (
                            <p className="text-gray-500">Debes iniciar sesión para comentar.</p>
                        )}
                    </div>

                    {/* 2. Lista de Comentarios */}
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.comment_id} className="border-t pt-4">
                                <p className="text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Por **{comment.user?.username || 'Usuario Desconocido'}**
                                    {' '}· {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-gray-500">Sé el primero en comentar este video.</p>}
                    </div>
                </div>
                {/* ======================================================= */}
            </div>
        </div>
    );
}