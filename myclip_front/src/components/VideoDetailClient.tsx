// MYCLIP_FRONT/src/components/VideoDetailClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';

export type Video = any;
export type Comment = any;

type Props = {
  initialVideo: Video;
  initialComments: Comment[];
};

export default function VideoDetailClient({ initialVideo, initialComments }: Props) {
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(initialVideo ?? null);
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setVideo(initialVideo);
    setComments(initialComments ?? []);
  }, [initialVideo, initialComments]);

  const handleVote = async () => {
    if (!video || voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/videos/${video.video_id}/vote`, {}, { withCredentials: true });
      // servidor devuelve { message, video }
      const updated = res.data?.video ?? res.data;
      setVideo(updated);
      setHasVoted(true);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      alert(err.response?.data?.message || 'Error al votar');
    } finally {
      setVoting(false);
    }
  };

  const loadComments = async () => {
    if (!video) return;
    try {
      const res = await api.get<Comment[]>(`/videos/${video.video_id}/comments`);
      setComments(res.data);
    } catch (e) {
      console.error('Error cargando comentarios', e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/videos/${video!.video_id}/comments`, { content: newComment.trim() }, { withCredentials: true });
      // backend devuelve comentario guardado
      await loadComments();
      setNewComment('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      alert(err.response?.data?.message || 'Error al publicar comentario');
    } finally {
      setPosting(false);
    }
  };

  if (!video) return <div>Cargando video...</div>;

  const playerOptions = {
    sources: [{ src: video.streamUrlHls || '', type: 'application/x-mpegURL' }],
  };

  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

      <div className="bg-black rounded-lg overflow-hidden mb-4">
        <VideoPlayer options={playerOptions} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600">Subido: {new Date(video.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-600">Vistas: {video.viewsCount ?? 0}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleVote}
            disabled={voting || hasVoted}
            className={`px-4 py-2 rounded ${hasVoted ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
          >
            {voting ? 'Votando...' : hasVoted ? 'Votado' : 'Votar'}
          </button>
          <span className="text-sm text-gray-700">Votos: {video.voteCount ?? 0}</span>
        </div>
      </div>

      {/* Descripción */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Descripción</h2>
        <p className="text-gray-700">{video.description}</p>
      </section>

      {/* Comentarios */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Comentarios ({comments.length})</h2>

        <form onSubmit={handlePostComment} className="mb-4">
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
          />
          <div className="flex gap-2">
            <button type="submit" disabled={posting} className="px-4 py-2 bg-blue-600 text-white rounded">
              {posting ? 'Publicando...' : 'Publicar'}
            </button>
            <button type="button" onClick={() => setNewComment('')} className="px-3 py-2 rounded border">
              Limpiar
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.comment_id} className="border-t pt-3">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500">
                {c.user?.username ?? 'Usuario'} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500">Sé el primero en comentar.</p>}
        </div>
      </section>
    </article>
  );
}
