'use client';

import React, { useState } from "react";
import api from "../../services/api.service";
import { useRouter } from "next/navigation";

type Props = {
  videoId: string;
  onSuccess: () => Promise<void>;
  onError: (msg: string) => void;
};

export default function CommentForm({ videoId, onSuccess, onError }: Props) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    onError("");

    try {
      await api.post(
        `/videos/${videoId}/comments`,
        { content },
        { withCredentials: true }
      );

      setContent("");
      await onSuccess();
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 401) {
        return router.push("/login");
      }

      if (status === 429) {
        return onError(err.response?.data?.message || "Has superado el límite.");
      }

      return onError(
        err.response?.data?.message || "Error al enviar el comentario."
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded-lg p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={3}
        placeholder="Escribe tu comentario…"
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
          onClick={() => setContent("")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
