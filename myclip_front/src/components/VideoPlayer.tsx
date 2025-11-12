'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
// Importamos el CSS de Video.js
import 'video.js/dist/video-js.css'; 

// Definición de las opciones del reproductor
interface VideoPlayerProps {
  options: {
    autoplay: boolean;
    controls: boolean;
    responsive: boolean;
    fluid: boolean;
    sources: {
      src: string;
      type: string;
    }[];
  };
}

// Este componente utiliza una referencia (ref) para interactuar con el DOM
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // 1. Inicializar el reproductor solo si no existe
    if (!playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js', 'vjs-big-play-centered');
      
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }
      
      // 2. Crear la instancia de Video.js
      const player = videojs(videoElement, options, () => {
        console.log('Video.js player is ready');
      });
      
      playerRef.current = player;
    }
  }, [options]);

  // 3. Limpieza: Destruir el reproductor al desmontar el componente (CRUCIAL)
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // 4. Renderizar el contenedor donde se montará el reproductor
  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};