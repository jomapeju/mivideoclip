"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api.service";
import type { NewsCategory } from "./NewsCard";

type AdminListItem = {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  createdAt: string;
  isPublished: boolean;
};

function categoryLabel(cat: NewsCategory) {
  switch (cat) {
    case "UPDATES":
      return "Actualizaciones";
    case "CONTESTS":
      return "Concursos";
    case "RULES":
      return "Cambios de normas";
    default:
      return "General";
  }
}

export default function AdminNewsList() {
  const router = useRouter();
  const [items, setItems] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminListItem[]>("/news", {
        withCredentials: true,
      });
      setItems(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al cargar las noticias.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta noticia?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/news/${id}`, { withCredentials: true });
      await loadNews();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "No se pudo eliminar la noticia."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando noticias…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No hay noticias todavía. Crea la primera.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Título
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Categoría
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado
            </th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n.id} className="border-b last:border-b-0">
              <td className="px-4 py-2 text-gray-900">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-gray-500">
                  /news/{n.slug}
                </div>
              </td>
              <td className="px-4 py-2 text-gray-700">
                {categoryLabel(n.category)}
              </td>
              <td className="px-4 py-2 text-gray-500 text-xs">
                {new Date(n.createdAt).toLocaleString("es-ES")}
              </td>
              <td className="px-4 py-2">
                {n.isPublished ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Publicado
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                    Borrador
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-right space-x-2">
                <button
                  onClick={() => router.push(`/admin/news/${n.slug}/edit`)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={deletingId === n.slug}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-300 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === n.slug ? "Eliminando…" : "Eliminar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
