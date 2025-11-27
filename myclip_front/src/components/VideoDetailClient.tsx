'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';
import { ChatBubbleOvalLeftIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';

export type Video = any;
export type Comment = any;

type Props = {
  initialVideo: Video;
  initialComments: Comment[];
};

export default function VideoDetailClient({ initialVideo, initialComments }: Props) {
  const router = useRouter();

  const [video, setVideo] = useState<Video | null>(initialVideo);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setVideo(initialVideo);
    setComments(initialComments ?? []);
  }, [initialVideo, initialComments]);

  // ================== VOTAR ==================
  const handleVote = async () => {
    if (!video || voting) return;

    setVoting(true);
    try {
      const res = await api.post(`/videos/${video.video_id}/vote`, {}, { withCredentials: true });
      const updated = res.data?.video ?? res.data;
      setVideo(updated);
      setHasVoted(true);
    } catch (err: any) {
      if (err.response?.status === 401) return router.push('/login');
      alert(err.response?.data?.message || 'Error al votar');
    } finally {
      setVoting(false);
    }
  };

  // ================== CARGAR COMENTARIOS ==================
  const loadComments = async () => {
    if (!video) return;

    try {
      const res = await api.get<Comment[]>(`/videos/${video.video_id}/comments`);
      setComments(res.data);
    } catch {}
  };

  // ================== PUBLICAR COMENTARIO ==================
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);

    try {
      await api.post(
        `/videos/${video!.video_id}/comments`,
        { content: newComment.trim() },
        { withCredentials: true }
      );

      setNewComment('');
      await loadComments();
    } catch (err: any) {
      if (err.response?.status === 401) return router.push('/login');
      alert(err.response?.data?.message || 'Error al publicar comentario');
    } finally {
      setPosting(false);
    }
  };

  if (!video) return <div>Cargando video...</div>;

  const playerOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{ src: video.streamUrlHls || '', type: 'application/x-mpegURL' }],
  };

  return (
    <article className="max-w-6xl mx-auto space-y-10">

      {/* ========================================= */}
      {/* TÍTULO */}
      {/* ========================================= */}
      <h1 className="text-3xl font-extrabold text-slate-900">
        {video.title}
      </h1>

      {/* ========================================= */}
      {/* VIDEO PLAYER */}
      {/* ========================================= */}
      <VideoPlayer options={playerOptions} />

      {/* ========================================= */}
      {/* INFO + VOTAR */}
      {/* ========================================= */}
      <div className="bg-white p-5 rounded-xl shadow-md border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            Subido el <strong>{new Date(video.createdAt).toLocaleDateString()}</strong>
          </p>
          <p className="text-sm text-gray-500">
            {video.viewsCount ?? 0} visualizaciones
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleVote}
            disabled={voting || hasVoted}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition
              ${hasVoted ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <HandThumbUpIcon className="h-5 w-5" />
            {voting ? 'Votando...' : hasVoted ? '✔ Votado' : 'Votar'}
          </button>

          <span className="text-lg font-semibold text-gray-900">
            {video.voteCount ?? 0} votos
          </span>
        </div>
      </div>

      {/* ========================================= */}
      {/* DESCRIPCIÓN */}
      {/* ========================================= */}
      <section className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-xl font-bold mb-3">Descripción</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {video.description}
        </p>
      </section>

      {/* ========================================= */}
      {/* COMENTARIOS */}
      {/* ========================================= */}
      <section className="bg-white p-6 rounded-xl shadow-md border space-y-6">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-2">
          <ChatBubbleOvalLeftIcon className="h-6 w-6 text-blue-600" />
          Comentarios ({comments.length})
        </h2>

        {/* FORM */}
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            className="w-full border rounded-lg p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            value={newComment}
            placeholder="Escribe tu comentario…"
            onChange={(e) => setNewComment(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={posting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              {posting ? 'Publicando…' : 'Publicar'}
            </button>

            <button
              type="button"
              onClick={() => setNewComment('')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* LISTA SCROLLEABLE */}
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
          {comments.map((c) => (
            <div key={c.comment_id} className="border-t pt-4">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>{c.user?.username ?? 'Usuario'}</strong> ·{' '}
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-gray-500">Sé el primero en comentar.</p>
          )}
        </div>
      </section>
    </article>
  );
}
