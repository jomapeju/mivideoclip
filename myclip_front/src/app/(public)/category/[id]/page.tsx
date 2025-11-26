import VideoGrid from "../../../../components/VideoGrid";

export default async function CategoryPage({ params }: any) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const videosRes = await fetch(`${apiBase}/videos/category/${params.id}`, {
    cache: "no-store",
  });

  const videos = await videosRes.json();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categoría</h1>

      <VideoGrid videos={videos} />
    </div>
  );
}
