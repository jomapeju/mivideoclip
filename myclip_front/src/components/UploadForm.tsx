'use client';

import React, { useState } from 'react';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { getCategoriesCached } from "../services/cache/category.service";

interface VideoResponse {
  video_id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE';
}

export const UploadForm = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<VideoResponse | null>(null);

  const [categories, setCategories] = useState<{ category_id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const MAX_CATEGORIES = 4;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Archivo seleccionado:', file);
      setVideoFile(file);
    } else {
      console.log('No se seleccionó ningún archivo');
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !songTitle || !videoFile) {
      setError('Por favor, complete todos los campos y seleccione un archivo.');
      return;
    }

    setLoading(true);

    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('file', videoFile); // nombre debe coincidir con Multer
      formData.append('title', title);
      formData.append('songTitle', songTitle);
      formData.append('description', description);
      formData.append('categoryIds', JSON.stringify(selectedCategories));

      // Log entries de FormData para debug
      console.log('=== FormData ===');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post<VideoResponse>('/videos/upload', formData, {
        // NO setear Content-Type, Axios lo hace automáticamente
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Progreso de subida: ${percent}%`);
        },
      });

      console.log('Respuesta del backend:', response.data);
      setSuccess(response.data);
      alert('Video subido y registrado correctamente.');
      router.push('/dashboard');

    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        router.push('/login');
        return;
      }
      const msg = axiosError.response?.data?.message || 'Error desconocido al subir el video.';
      console.error('Error al subir:', msg);
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
        const data = await getCategoriesCached();
        setCategories(data);
    }
    loadCategories();
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_CATEGORIES) {
        alert(`Máximo ${MAX_CATEGORIES} categorías.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg max-w-lg mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Subir Nuevo Videoclip</h2>

      {error && <p className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded">{error}</p>}
      {loading && <p className="p-3 mb-4 bg-blue-100 text-blue-700 rounded">Subiendo... Por favor espere.</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título del Video</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Canción</label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de Video (.mp4, .mov)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>

        {categories.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <label key={cat.category_id} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.category_id)}
                  onChange={() => toggleCategory(cat.category_id)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition duration-150"
        >
          {loading ? 'Procesando Subida...' : 'Subir Videoclip'}
        </button>
      </div>
    </form>
  );
};
