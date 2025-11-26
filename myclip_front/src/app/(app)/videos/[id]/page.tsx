// MYCLIP_FRONT/src/app/(app)/videos/[id]/page.tsx
import React from "react";
import VideoDetailClient from "../../../../components/VideoDetailClient";
import VideoGrid from "../../../../components/VideoGrid";
import { cookies } from "next/headers";

type Video = any;
type Comment = any;

interface PageProps {
  params: { id: string };
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL no definida");

  // Forward cookies from incoming request -> backend so protected endpoints can use them if needed
  const cookieStore = cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  // 1) Video (cache corto)
  const videoRes = await fetch(`${apiBase}/videos/${id}`, {
    headers: { Cookie: cookieString },
    // Rerender cada 30s para mantener relativamente frescos los metadatos
    next: { revalidate: 30 },
  });
  if (!videoRes.ok) {
    // mostrar 404 o fallback sencillo
    return <div className="p-8">Video no encontrado (status {videoRes.status})</div>;
  }
  const videoData: { video: Video } | Video = await videoRes.json();
  // backend puede devolver directamente el objeto video o { video } — adaptalo según tu API
  const video = (videoData as any).video ?? (videoData as any);

  // 2) Comments (no-store para ver el estado real)
  const commentsRes = await fetch(`${apiBase}/videos/${id}/comments`, {
    headers: { Cookie: cookieString },
    cache: "no-store",
  });
  const comments = commentsRes.ok ? await commentsRes.json() : [];

  // 3) Recomendados (ej: populares o similares)
  const recommendedRes = await fetch(`${apiBase}/videos/popular?limit=6`, {
    headers: { Cookie: cookieString },
    next: { revalidate: 60 }, // revalida cada 60s
  });
  const recommended = recommendedRes.ok ? await recommendedRes.json() : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Server-rendered initial UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 space-y-6">
          {/* Video player + client interactivity */}
          <VideoDetailClient initialVideo={video} initialComments={comments} />
        </main>

        <aside className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-4">Recomendados</h3>
          <VideoGrid videos={recommended} />
        </aside>
      </div>
    </div>
  );
}
