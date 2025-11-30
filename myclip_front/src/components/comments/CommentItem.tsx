'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api.service";
import { Comment } from "./comments.types";

type Props = {
  comment: Comment;
  videoId: string;
  onChanged: () => Promise<void>; // para recargar lista desde el padre
};

export default function CommentItem({ comment, videoId, onChanged }: Props) {

  const router = useRouter();

  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [reacting, setReacting] = useState(false);

  const likeCount = comment.likeCount ?? 0;
  const dislikeCount = comment.dislikeCount ?? 0;

  // ==============================
  // LIKE / DISLIKE
  // ==============================
  async function handleReact(value: 1 | -1) {
    if (reacting) return;
    setReacting(true);

    try {
      await api.post(
        `/videos/${videoId}/comments/${comment.comment_id}/react`,
        { value },
        { withCredentials: true }
      );

      await onChanged();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        return router.push("/login");
      }

      alert(
        err?.response?.data?.message ||
          "No se pudo registrar tu reacción."
      );
    } finally {
      setReacting(false);
    }
  }

  // ==============================
  // ENVIAR RESPUESTA
  // ==============================
  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);

    try {
      await api.post(
        `/videos/${videoId}/comments`,
        {
          content: replyText.trim(),
          parentId: comment.comment_id,
        },
        { withCredentials: true }
      );

      setReplyText("");
      setReplying(false);
      await onChanged();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        return router.push("/login");
      }

      if (status === 429) {
        alert(
          err?.response?.data?.message ||
            "Has respondido demasiadas veces en poco tiempo."
        );
      } else {
        alert("Error al enviar la respuesta.");
      }
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div className="border-t pt-4 mt-2">
      {/* CONTENIDO PRINCIPAL DEL COMENTARIO */}
      <p className="text-gray-800 whitespace-pre-wrap">
        {comment.content}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        <strong>{comment.user?.username ?? "Usuario"}</strong> ·{" "}
        {new Date(comment.createdAt).toLocaleString()}
      </p>

      {/* ACCIONES */}
      <div className="flex items-center gap-4 text-xs mt-2">
        {/* LIKE */}
        <button
          type="button"
          disabled={reacting}
          onClick={() => handleReact(1)}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          👍 <span>{likeCount}</span>
        </button>

        {/* DISLIKE */}
        <button
          type="button"
          disabled={reacting}
          onClick={() => handleReact(-1)}
          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          👎 <span>{dislikeCount}</span>
        </button>

        {/* RESPONDER */}
        <button
          type="button"
          onClick={() => setReplying((prev) => !prev)}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          💬 Responder
        </button>
      </div>

      {/* FORMULARIO DE RESPUESTA */}
      {replying && (
        <form
          onSubmit={handleReplySubmit}
          className="mt-3 ml-4 space-y-2"
        >
          <textarea
            rows={2}
            className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta…"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={sendingReply}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sendingReply ? "Enviando…" : "Responder"}
            </button>

            <button
              type="button"
              onClick={() => {
                setReplying(false);
                setReplyText("");
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* HIJOS (RESPUESTAS) */}
      {Array.isArray(comment.children) && comment.children.length > 0 && (
        <div className="mt-3 ml-4 space-y-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.comment_id}
              comment={child}
              videoId={videoId}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
