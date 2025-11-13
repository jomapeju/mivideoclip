'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api.service';
import { Video } from '../../../lib/video.types';
import axios from 'axios';

// Definición de tipos para el ranking de usuarios
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

    // Función para cargar ambos rankings simultáneamente
    const fetchRankings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Utilizamos Promise.all para hacer las dos peticiones a la vez
            const [videosRes, usersRes] = await Promise.all([
                api.get<Video[]>('videos/popular?limit=10'), // Top 10 videos
                api.get<UserRanking[]>('users/ranking?limit=10'), // Top 10 usuarios
            ]);

            setPopularVideos(videosRes.data);
            setUserRanking(usersRes.data);
        } catch (err) {
            console.error('Error fetching rankings:', err);
            setError('No se pudieron cargar las clasificaciones. Verifique la conexión al backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRankings();
    }, [fetchRankings]);

    // --- Componente de Tarjeta de Ranking reutilizable ---
    const RankingCard = ({ title, data, valueKey, labelKey }: { title: string, data: any[], valueKey: string, labelKey: string }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center">
                {title} 🏆
            </h2>
            {data.length === 0 ? (
                <p className="text-gray-500">No hay datos suficientes para crear el ranking.</p>
            ) : (
                <ol className="list-decimal pl-5 space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="flex justify-between items-center text-gray-800 border-b border-dashed pb-1">
                            <span className="font-medium text-lg">
                                {index + 1}. {item[labelKey]}
                            </span>
                            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-0.5 rounded-full">
                                {item[valueKey]} {valueKey.includes('vote') ? 'Votos' : 'Puntos'}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
    // ---------------------------------------------------

    if (loading) return <p className="text-center mt-20 text-xl">Cargando clasificaciones...</p>;
    if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Clasificación Global</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ranking de Videos Populares */}
                    <RankingCard 
                        title="Videos Más Votados" 
                        data={popularVideos} 
                        valueKey="voteCount" 
                        labelKey="title" 
                    />

                    {/* Ranking de Usuarios Populares */}
                    <RankingCard 
                        title="Usuarios con Mayor Reputación" 
                        data={userRanking} 
                        valueKey="reputationScore" 
                        labelKey="username" 
                    />
                </div>
                <div className="text-center mt-10">
                    <p className="text-gray-500 text-sm">Los rankings se basan en el Top 10 de votos y puntos de reputación.</p>
                </div>
            </div>
        </div>
    );
}