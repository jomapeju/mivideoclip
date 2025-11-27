'use client';

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

// Estilos extra Video.js modernos
import './videojs-theme.css';

interface VideoPlayerProps {
  options: {
    autoplay?: boolean;
    controls?: boolean;
    responsive?: boolean;
    fluid?: boolean;
    sources: {
      src: string;
      type: string;
    }[];
  };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add(
        'video-js',
        'vjs-big-play-centered',
        'vjs-theme-myclip'
      );

      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      const player = videojs(videoElement, options, () => {
        setTimeout(() => setLoading(false), 500); // Suaviza transición
      });

      playerRef.current = player;
    }
  }, [options]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
      {/* LOADER ⬇ */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}

      {/* CONTENEDOR DEL PLAYER */}
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </div>
  );
};
