// MYCLIP_FRONT/src/components/VideoGrid.tsx
import React from 'react';
import Link from 'next/link';

export default function VideoGrid({ videos = [] }: { videos: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {videos.map((v: any) => (
        <Link key={v.video_id} href={`/videos/${v.video_id}`} className="block bg-white rounded shadow overflow-hidden">
          <div className="h-44 bg-gray-200 flex items-center justify-center">
            {/* thumbnail real si existe */}
            {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={v.title} /> : <div className="text-sm text-gray-600">Sin miniatura</div>}
          </div>
          <div className="p-3">
            <h3 className="font-semibold">{v.title}</h3>
            <p className="text-xs text-gray-500">{v.songTitle}</p>
            <p className="text-sm text-gray-700 mt-1">{v.voteCount ?? 0} ⭐</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

