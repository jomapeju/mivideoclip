// MYCLIP_FRONT/src/app/(public)/category/[id]/page.tsx

import VideoGrid from "../../../../components/VideoGrid";

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // -------------------------
  // 1) Category info
  // -------------------------
  const categoryRes = await fetch(`${apiBase}/videos/categories`, {
    cache: "force-cache",
    next: { revalidate: 120 },
  });

  const allCategories = categoryRes.ok ? await categoryRes.json() : [];
  const category = allCategories.find((c: any) => c.category_id === params.id);

  // -------------------------
  // 2) Fetch videos
  // -------------------------
  const videosRes = await fetch(`${apiBase}/videos/category/${params.id}`, {
    cache: "no-store",
  });

  const videos = videosRes.ok ? await videosRes.json() : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* ---------------------------- */}
      {/* Breadcrumb */}
      {/* ---------------------------- */}
      <div className="text-sm text-gray-500">
        <a href="/" className="hover:underline">Inicio</a> /{" "}
        <span className="text-gray-700 font-medium">Categoría</span>
      </div>

      {/* ---------------------------- */}
      {/* Encabezado de categoría */}
      {/* ---------------------------- */}
      <header className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 text-2xl font-bold">
          {category?.name?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {category?.name ?? "Categoría"}
          </h1>
          <p className="text-gray-600 mt-1">
            {videos.length} vídeo{videos.length !== 1 ? "s" : ""} disponibles
          </p>
        </div>
      </header>

      {/* ---------------------------- */}
      {/* Listado de vídeos */}
      {/* ---------------------------- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Vídeos de esta categoría
        </h2>

        {videos.length === 0 ? (
          <p classnName="text-gray-500">No hay vídeos en esta categoría.</p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </section>

    </div>
  );
}

