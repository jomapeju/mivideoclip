import VideoGrid from "../../../components/VideoGrid";

export default async function SearchPage({ searchParams }: any) {
  const q = searchParams.q || "";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const res = await fetch(`${apiBase}/videos/search?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });

  const results = await res.json();

  return (
    <div className="space-y-6">
      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar video, categoría o canción..."
          className="border p-2 rounded w-full"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Buscar
        </button>
      </form>

      <h2 className="text-xl font-semibold">Resultados</h2>
      <VideoGrid videos={results} />
    </div>
  );
}
