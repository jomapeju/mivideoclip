'use client';

import React, { useState } from 'react';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

// Definición de tipos para la respuesta (opcional pero recomendado)
interface VideoResponse {
  video_id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE';
}

export const UploadForm = () => {
  const router = useRouter();
  
  // Estado para los campos de texto
  const [title, setTitle] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Estado para el archivo seleccionado
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Estados de la interfaz de usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<VideoResponse | null>(null);

  // Manejador de cambio para el input de tipo 'file'
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    } else {
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Validación básica
    if (!title || !songTitle || !videoFile) {
      setError('Por favor, complete todos los campos y seleccione un archivo.');
      return;
    }
    
    setLoading(true);

    // 2. Crear el objeto FormData
    // Este objeto es CRÍTICO para enviar archivos (multipart/form-data)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('songTitle', songTitle);
    formData.append('description', description);
    formData.append('file', videoFile); // 'file' debe coincidir con el nombre del interceptor de Multer

    try {
      // 3. Enviar la petición a la API
      const response = await api.post<VideoResponse>('videos/upload', formData, {
        headers: {
          // Importante: No establecer Content-Type, Axios lo hace automáticamente
          // cuando se usa FormData, incluyendo el boundary correcto.
          'Content-Type': 'multipart/form-data', 
        },
        // Opcional: Mostrar el progreso de la subida
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Progreso de subida: ${percentCompleted}%`);
        },
      });

      setSuccess(response.data);
      alert('Video subido y registrado. El procesamiento comenzará en segundo plano.');
      
      // 4. Redirigir al dashboard o a la página de estado del video
      router.push(`/dashboard`); 

    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Error desconocido al subir el video.';
      setError(`Error: ${errorMessage}`);

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg max-w-lg mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Subir Nuevo Videoclip</h2>
      
      {error && <p className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded">{error}</p>}
      {loading && <p className="p-3 mb-4 bg-blue-100 text-blue-700 rounded">Subiendo... Por favor espere. (Ver progreso en consola)</p>}

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
            accept="video/*" // Aceptar solo archivos de video
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required 
          />
        </div>

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