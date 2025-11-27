"use client";

import React from "react";
import Link from "next/link";

export default function VideoGrid({ videos = [] }: { videos: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((v: any) => (
        <Link
          key={v.video_id}
          href={`/videos/${v.video_id}`}
          className="group rounded-xl overflow-hidden bg-white shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
        >
          {/* --------- Thumbnail --------- */}
          <div className="relative aspect-video bg-gray-200">
            {v.thumbnailUrl ? (
              <img
                src={v.thumbnailUrl}
                alt={v.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Sin miniatura
              </div>
            )}
          </div>

          {/* --------- Info --------- */}
          <div className="p-3 space-y-1.5">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition">
              {v.title}
            </h3>

            <p className="text-xs text-gray-500">{v.songTitle}</p>

            <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
              ⭐ {v.voteCount ?? 0}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
