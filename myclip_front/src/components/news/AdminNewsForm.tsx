"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api.service";
import type { NewsCategory } from "./NewsCard";

export type AdminNewsPost = {
  id?: string;
  title: string;
  slug: string;
  category: NewsCategory;
  excerpt?: string;
  content: string;
  isPublished: boolean;
};

type Props = {
  mode: "create" | "edit";
  initialData?: AdminNewsPost;
};

export default function AdminNewsForm({ mode, initialData }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState<NewsCategory>(
    initialData?.category ?? "UPDATES"
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ?? true
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        title,
        slug,
        category,
        excerpt,
        content,
        isPublished,
      };

      if (mode === "create") {
        await api.post("/admin/news", payload, { withCredentials: true });
      } else if (mode === "edit" && initialData?.id) {
        await api.put(`/admin/news/${initialData.id}`, payload, {
          withCredentials: true,
        });
      }

      router.push("/admin/news");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "No se pudo guardar la noticia.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSlugFromTitle = () => {
    if (!title) return;
    const s = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(s);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </p>
      )}

      {/* TÍTULO */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* SLUG */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Slug (URL)
          </label>
          <button
            type="button"
            onClick={handleSlugFromTitle}
            className="text-xs text-blue-600 hover:underline"
          >
            Generar desde título
          </button>
        </div>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">
          URL final: <code>/news/{slug || "<slug>"}</code>
        </p>
      </div>

      {/* CATEGORÍA */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          value={category}
          onChange={(e) => setCategory(e.target.value as NewsCategory)}
        >
          <option value="ACTUALIZACIONES">Actualizaciones</option>
          <option value="CONCURSOS">Concursos</option>
          <option value="CAMBIOS_NORMAS">Cambios de normas</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      {/* EXCERPT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resumen corto
        </label>
        <textarea
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Texto breve que aparecerá en las listas de noticias."
        />
      </div>

      {/* CONTENIDO */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenido
        </label>
        <textarea
          rows={10}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Aquí va el texto completo de la noticia."
          required
        />
      </div>

      {/* PUBLICADO */}
      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          type="checkbox"
          className="h-4 w-4"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Publicar noticia (visible en la web)
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving
            ? "Guardando…"
            : mode === "create"
            ? "Crear noticia"
            : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
