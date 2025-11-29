'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { VideoPlayer } from "./VideoPlayer";
import api from "../services/api.service";
import CommentsSection from "./comments/CommentsSection";

export type Video = any;
export type Comment = any;

type Props = {
  initialVideo: Video;
  initialComments: Comment[];
};

export default function VideoDetailClient({ initialVideo, initialComments }: Props) {
  const router = useRouter();
  const [video, setVideo] = React.useState<Video | null>(initialVideo);
  const [voting, setVoting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);

  React.useEffect(() => {
    setVideo(initialVideo);
  }, [initialVideo]);

  // ================== VOTAR ==================
  const handleVote = async () => {
    if (!video || voting) return;

    setVoting(true);
    try {
      const res = await api.post(`/videos/${video.video_id}/vote`, {}, { withCredentials: true });
      const updated = res.data?.video ?? res.data;
      setVideo(updated);
      setHasVoted(true);
    } catch (err: any) {
      if (err.response?.status === 401) return router.push("/login");
      alert(err.response?.data?.message || "Error al votar");
    } finally {
      setVoting(false);
    }
  };

  if (!video) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Cargando vídeo…
      </div>
    );
  }

  const playerOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{ src: video.streamUrlHls || "", type: "application/x-mpegURL" }],
  };

  return (
    <article className="space-y-10">

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold text-slate-900">
        {video.title}
      </h1>

      {/* VIDEO */}
      <VideoPlayer options={playerOptions} />

      {/* INFO + VOTO */}
      <div className="bg-white p-5 rounded-xl shadow-md border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            Subido el{" "}
            <strong>{new Date(video.createdAt).toLocaleDateString()}</strong>
          </p>
          <p className="text-sm text-gray-500">
            {video.viewsCount ?? 0} visualizaciones
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleVote}
            disabled={voting || hasVoted}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition
              ${
                hasVoted
                  ? "bg-gray-300 text-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            <HandThumbUpIcon className="h-5 w-5" />
            {voting ? "Votando..." : hasVoted ? "✔ Votado" : "Votar"}
          </button>

          <span className="text-lg font-semibold text-gray-900">
            {video.voteCount ?? 0} votos
          </span>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <section className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-xl font-bold mb-3">Descripción</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {video.description}
        </p>
      </section>

      {/* COMENTARIOS (componente separado) */}
      <CommentsSection
        videoId={video.video_id}
        initialComments={initialComments ?? []}
      />
    </article>
  );
}
