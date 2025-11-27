import VideoGrid from "../../../components/VideoGrid";

export const revalidate = 0; // siempre fresh

export default async function SearchPage({ searchParams }: any) {
  const q = searchParams.q?.trim() || "";
  const hasQuery = q.length > 0;

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const res = hasQuery
    ? await fetch(`${apiBase}/videos/search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      })
    : null;

  const results = res?.ok ? await res.json() : [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Título */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Buscar videos
        </h1>

        {/* Formulario */}
        <form
          method="GET"
          className="flex gap-3"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título, canción o categoría..."
            className="flex-1 rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2 text-slate-200 placeholder:text-slate-500 shadow-soft focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-brand-primary text-white font-semibold shadow-soft hover:bg-red-600 transition"
          >
            Buscar
          </button>
        </form>

        {/* Resultados */}
        {hasQuery ? (
          <>
            <h2 className="text-xl font-semibold text-slate-200">
              Resultados para:{" "}
              <span className="text-brand-primary">"{q}"</span>
            </h2>

            {results.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No se encontraron videos que coincidan con la búsqueda.
              </p>
            ) : (
              <VideoGrid videos={results} />
            )}
          </>
        ) : (
          <p className="text-slate-400 text-sm">
            Escribe algo en el buscador para ver resultados.
          </p>
        )}
      </div>
    </div>
  );
}
