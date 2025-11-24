// src/app/videos/[id]/page.tsx
import React from 'react';
import VideoDetailClient from '../../../../components/VideoDetailClient'; // nuevo cliente interactivo
import Link from 'next/link';

// Server Component (NO "use client")
type Params = { params: { id: string } };

export default async function VideoDetailPage({ params }: Params) {
  const id = params.id;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  // SSR fetch (ejecuta en servidor). No incluimos cookies: vista pública.
  const res = await fetch(`${apiBase}/videos/${id}`, {
    method: 'GET',
    // no-cache para siempre traer la info actual
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <div className="p-10 text-center text-red-600">
        Error cargando el video (status: {res.status})
      </div>
    );
  }

  const video = await res.json(); // backend devuelve el objeto Video
  // Si tu backend devuelve { video: ... } adáptalo: const video = await res.json().video;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 underline mb-4 inline-block">← Volver</Link>
        {/* Pasamos los datos al cliente interactivo */}
        <VideoDetailClient initialVideo={video} />
      </div>
    </div>
  );
}
