// MYCLIP_FRONT/src/app/(app)/videos/[id]/page.tsx

import React from "react";
import { cookies } from "next/headers";
import VideoDetailClient from "../../../../components/VideoDetailClient";
import VideoGrid from "../../../../components/VideoGrid";

type Video = any;
type Comment = any;

interface PageProps {
  params: { id: string };
}

export const revalidate = 30;

export default async function VideoPage({ params }: PageProps) {
  const { id } = params;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  if (!apiBase) throw new Error("❌ NEXT_PUBLIC_API_URL no definida");

  // -----------------------------
  // 🔐 Forward de cookies al backend
  // -----------------------------
  const cookieStore = cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  // -----------------------------
  // 1) 📺 Obtener VIDEO (SSR, revalidate 30s)
  // -----------------------------
  const videoRes = await fetch(`${apiBase}/videos/${id}`, {
    headers: { Cookie: cookieString },
    next: { revalidate: 30 },
  });

  if (!videoRes.ok) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center text-gray-700">
        <h1 className="text-2xl font-bold mb-2">Video no encontrado</h1>
        <p className="text-gray-500">
          Código de error: {videoRes.status}
        </p>
      </div>
    );
  }

  const videoData: { video: Video } | Video = await videoRes.json();
  const video = (videoData as any).video ?? videoData;

  // -----------------------------
  // 2) 💬 Obtener comentarios (no-store)
  // -----------------------------
  const commentsRes = await fetch(`${apiBase}/videos/${id}/comments`, {
    headers: { Cookie: cookieString },
    cache: "no-store",
  });

  const comments = commentsRes.ok ? await commentsRes.json() : [];

  // -----------------------------
  // 3) ⭐ Recomendados (populares)
  // -----------------------------
  const recommendedRes = await fetch(`${apiBase}/videos/popular?limit=6`, {
    headers: { Cookie: cookieString },
    next: { revalidate: 60 },
  });

  const recommended = recommendedRes.ok ? await recommendedRes.json() : [];

  // -----------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* GRID general */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ----------------------------- */}
        {/* MAIN — VIDEO + COMENTARIOS */}
        {/* ----------------------------- */}
        <main className="lg:col-span-2 space-y-8">
          <VideoDetailClient initialVideo={video} initialComments={comments} />
        </main>

        {/* ----------------------------- */}
        {/* ASIDE — RECOMENDADOS */}
        {/* ----------------------------- */}
        <aside className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recomendados para ti
          </h3>

          {recommended.length === 0 && (
            <p className="text-gray-500 text-sm">No hay videos recomendados.</p>
          )}

          <VideoGrid videos={recommended} />
        </aside>

      </div>
    </div>
  );
}
