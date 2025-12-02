import NewsCard, { NewsPost } from "../../../components/news/NewsCard";

export const revalidate = 120;

export default async function NewsPage() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const res = await fetch(`${apiBase}/news`, {
    cache: "force-cache",
    next: { revalidate },
  });

  const posts: NewsPost[] = res.ok ? await res.json() : [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Noticias y novedades
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Aquí encontrarás actualizaciones de la plataforma, nuevos concursos,
          cambios de normas y avisos importantes.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-500">
          Todavía no hay noticias publicadas.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map((p) => (
            <NewsCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}
