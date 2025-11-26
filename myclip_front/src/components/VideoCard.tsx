export default function VideoCard({ video }: { video: any }) {
  return (
    <a href={`/video/${video.video_id}`} className="block bg-white shadow rounded-md overflow-hidden">
      <img src={video.thumbnailUrl} className="w-full aspect-video object-cover" />

      <div className="p-3">
        <h3 className="font-semibold">{video.title}</h3>
        {video.songTitle && (
          <p className="text-sm text-gray-500">🎵 {video.songTitle}</p>
        )}
      </div>
    </a>
  );
}
