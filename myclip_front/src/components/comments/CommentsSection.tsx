"use client";

import React from "react";
import api from "../../services/api.service";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import CommentsList from "./CommentsList";
import type { Comment } from "../VideoDetailClient";

type Props = {
  videoId: string;
  initialComments: Comment[];
};

export default function CommentsSection({ videoId, initialComments }: Props) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Cargar comentarios al montar (y que se vea el GET en Network)
  const loadComments = React.useCallback(async () => {
    try {
      const res = await api.get<Comment[]>(`/videos/${videoId}/comments`);
      setComments(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error cargando comentarios", err);
      setError("No se pudieron cargar los comentarios.");
    }
  }, [videoId]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 📝 Publicar comentario
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    setError(null);

    try {
      await api.post(
        `/videos/${videoId}/comments`,
        { content: newComment.trim() },
        { withCredentials: true },
      );

      setNewComment("");
      await loadComments();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Debes iniciar sesión para comentar.");
      } else if (err.response?.status === 429) {
        setError(err.response.data?.message || "Has comentado demasiado rápido.");
      } else {
        setError("Error al publicar el comentario.");
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-md border space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-bold mb-2">
        <ChatBubbleOvalLeftIcon className="h-6 w-6 text-blue-600" />
        Comentarios ({comments.length})
      </h2>

      {/* Mensaje de error visible */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {/* FORMULARIO */}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {posting ? "Publicando…" : "Publicar"}
          </button>

          <button
            type="button"
            onClick={() => setNewComment("")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* LISTA SCROLLEABLE */}
      <div className="max-h-96 overflow-y-auto pr-2">
        <CommentsList comments={comments} />
      </div>
    </section>
  );
}
