'use client';

import React, { useState, useEffect } from 'react';
import { Video as VideoType, Comment as CommentType } from '../lib/video.types';
import { VideoPlayer } from './VideoPlayer';
import { registerVote, getCommentsByVideoId, createComment } from '../services/videos.service';
import { useRouter } from 'next/navigation';
import { getClientUser } from '../lib/auth';

type Props = { initialVideo: VideoType };

export default function VideoDetailClient({ initialVideo }: Props) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoType | null>(initialVideo);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<any | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isVoted, setIsVoted] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    // 1) Cargar sesión real desde el backend
    getClientUser().then(setUser);

    // 2) Cargar comentarios
    loadComments();
  }, []);

  async function loadComments() {
    if (!video) return;
    try {
      const data = await getCommentsByVideoId(video.video_id);
      setComments(data);
    } catch (err) {
      console.error('Error cargando comentarios', err);
    }
  }

  async function handleVote() {
    if (!video || isVoted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const updated = await registerVote(video.video_id);
      setVideo(updated);
      setIsVoted(true);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      alert(err.message || 'Error al votar');
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsPosting(true);
    try {
      await createComment(video!.video_id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      alert('No se pudo publicar el comentario.');
    } finally {
      setIsPosting(false);
    }
  }

  if (!video) return <div className="p-10 text-center">Video no encontrado</div>;

  const playerOptions = {
    sources: [{ src: video.streamUrlHls || '', type: 'application/x-mpegURL' }],
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

      <div className="bg-black rounded-xl shadow-2xl mb-6">
        <VideoPlayer options={playerOptions} />
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg shadow flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Votos: {video.voteCount}</h2>
        <button
          onClick={handleVote}
          disabled={isVoted}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            isVoted ? 'bg-gray-400' : 'bg-green-500'
          }`}
        >
          {isVoted ? '👍 Votado' : '⭐ Votar'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold">Descripción:</h2>
        <p className="text-gray-700">{video.description}</p>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Comentarios ({comments.length})</h2>

        {isAuthenticated ? (
          <form onSubmit={handlePostComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full p-3 border rounded mb-2"
            />
            <button type="submit" disabled={isPosting} className="bg-blue-600 text-white px-4 py-2 rounded">
              {isPosting ? 'Publicando...' : 'Publicar Comentario'}
            </button>
          </form>
        ) : (
          <p className="text-gray-500 mb-4">
            Debes <a href="/login" className="text-blue-600 underline">iniciar sesión</a> para comentar.
          </p>
        )}

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.comment_id} className="border-t pt-4">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                Por <strong>{c.user?.username || 'Usuario'}</strong> ·{' '}
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500">Sé el primero en comentar este video.</p>}
        </div>
      </div>
    </>
  );
}
