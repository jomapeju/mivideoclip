"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api.service";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { getCategoriesCached } from "../services/cache/category.service";
import {
  FilmIcon,
  TagIcon,
  Bars3BottomLeftIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

interface VideoResponse {
  video_id: string;
  title: string;
  status: "PENDING" | "ACTIVE";
}

export const UploadForm = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<
    { category_id: string; name: string }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const MAX_CATEGORIES = 4;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");


  // ================================
  //   FILE PREVIEW
  // ================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setVideoFile(null);
      setPreview(null);
      return;
    }

    setVideoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // ================================
  //   LOAD CATEGORIES
  // ================================
  useEffect(() => {
    async function load() {
      const data = await getCategoriesCached();
      setCategories(data);
    }
    load();
  }, []);

  // ================================
  //   SUBMIT
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !songTitle || !videoFile) {
      setError("Por favor, complete todos los campos y seleccione un archivo.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("title", title);
      formData.append("songTitle", songTitle);
      formData.append("description", description);
      formData.append("categoryIds", JSON.stringify(selectedCategories));
      formData.append("visibility", visibility);


      const res = await api.post<VideoResponse>("/videos/upload", formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          console.log("Progress:", percent);
        },
      });

      router.push("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const msg =
        axiosErr.response?.data?.message ||
        "Error desconocido al subir el video.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  //   CATEGORY SELECTOR
  // ================================
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CATEGORIES) {
        alert(`Máximo ${MAX_CATEGORIES} categorías.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  // ================================
  //   UI
  // ================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ERROR MESSAGE */}
      {error && (
        <p className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </p>
      )}

      {/* VIDEO PREVIEW */}
      {preview && (
        <div className="rounded-lg overflow-hidden shadow border mb-4">
          <video src={preview} controls className="w-full max-h-80" />
        </div>
      )}

      {/* TITLE */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1 ">
          <FilmIcon className="h-4 w-4" />
          Título del Video
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* SONG TITLE */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
          <MusicalNoteIcon className="h-4 w-4" />
          Título de la Canción
        </label>
        <input
          type="text"
          className="w-full border p-3 rounded-lg text-gray-800"
          required
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
          <Bars3BottomLeftIcon className="h-4 w-4" />
          Descripción
        </label>
        <textarea
          rows={3}
          className="w-full border p-3 rounded-lg text-gray-800"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* VISIBILITY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Privacidad
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
          className="w-full border p-3 rounded-lg text-gray-800"
        >
          <option value="PUBLIC">Público</option>
          <option value="PRIVATE">Privado</option>
        </select>
      </div>


      {/* FILE UPLOAD */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          Archivo de Video (.mp4, .mov)
        </label>
        <input
          type="file"
          accept="video/*"
          capture="user"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600"
          required
        />

      </div>

      {/* CATEGORY SELECTOR */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 gap-1">
          <TagIcon className="h-4 w-4" />
          Categorías (máx. {MAX_CATEGORIES})
        </label>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = selectedCategories.includes(c.category_id);

            return (
              <button
                key={c.category_id}
                type="button"
                onClick={() => toggleCategory(c.category_id)}
                className={`px-3 py-1 rounded-full text-sm border transition
                  ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Subiendo..." : "Subir Videoclip"}
      </button>
    </form>
  );
};
