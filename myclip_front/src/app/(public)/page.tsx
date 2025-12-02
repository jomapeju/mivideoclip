import VideoGrid from "../../components/VideoGrid";
import type { Contest } from "../../lib/video.types";

export const revalidate = 60;

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  category: "UPDATES" | "CONTESTS" | "RULES" | "OTHER";
  excerpt?: string;
  createdAt: string;
};

export default async function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const [categoriesRes, latestRes, popularRes, contestsRes, newsRes] =
    await Promise.all([
      fetch(`${apiBase}/videos/categories`, { cache: "no-store" }),
      fetch(`${apiBase}/videos`, { cache: "no-store" }),
      fetch(`${apiBase}/videos/popular`, { cache: "no-store" }),
      fetch(`${apiBase}/contests`, {
        cache: "force-cache",
        next: { revalidate },
      }),
      fetch(`${apiBase}/news?limit=3`, {
        cache: "force-cache",
        next: { revalidate: 120 },
      }),
    ]);

  const categories = await categoriesRes.json();
  const latest = await latestRes.json();
  const popular = await popularRes.json();
  const contests: Contest[] = contestsRes.ok ? await contestsRes.json() : [];
  const news: NewsPost[] = newsRes.ok ? await newsRes.json() : [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-16">

      {/* ------------------------------ */}
      {/* 🆕 HERO SECTION */}
      {/* ------------------------------ */}
      <section className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-10 shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4 drop-shadow">
          Bienvenido a <span className="text-yellow-300">MyClip</span>
        </h1>
        <p className="text-lg opacity-90 max-w-2xl">
          Comparte tus videoclips, participa en concursos, descubre contenido nuevo y vota tus favoritos.
        </p>
      </section>

      {/* ------------------------------ */}
      {/* ⭐ VÍDEOS RECIENTES */}
      {/* ------------------------------ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white-900">🎬 Videos Recientes</h2>
        </div>

        <VideoGrid videos={latest} />
      </section>

      {/* ------------------------------ */}
      {/* 🔥 POPULARES */}
      {/* ------------------------------ */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white-900">🔥 Populares</h2>
        <VideoGrid videos={popular} />
      </section>

      {/* ------------------------------ */}
      {/* 🏆 CONCURSOS ACTIVOS */}
      {/* ------------------------------ */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white-900">🏆 Concursos Activos</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.length === 0 && (
            <p className="text-gray-500 text-lg">No hay concursos en este momento.</p>
          )}

          {contests.map((c) => (
            <a
              key={c.contest_id}
              href={`/contests/${c.contest_id}`}
              className="p-6 rounded-xl bg-white shadow hover:shadow-md border hover:border-gray-300 transition-all duration-200"
            >
              <h3 className="font-bold text-xl text-gray-900">{c.title}</h3>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {c.description}
              </p>

              <span
                className={`mt-4 inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                  c.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : c.status === "UPCOMING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {c.status}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ------------------------------ */}
      {/* 📰 ÚLTIMAS NOTICIAS */}
      {/* ------------------------------ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white-900">📰 Últimas noticias</h2>
          <a
            href="/news"
            className="text-sm text-blue-300 hover:text-blue-200 underline"
          >
            Ver todas
          </a>
        </div>

        {news.length === 0 && (
          <p className="text-gray-400 text-sm">
            De momento no hay noticias publicadas.
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {news.map((n) => (
            <a
              key={n.id}
              href={`/news/${n.slug}`}
              className="block rounded-xl bg-white shadow border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition"
            >
              <p className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleDateString("es-ES")}
              </p>
              <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
                {n.title}
              </h3>
              {n.excerpt && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {n.excerpt}
                </p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ------------------------------ */}
      {/* 📂 CATEGORÍAS */}
      {/* ------------------------------ */}
      <section className="space-y-6 pb-10">
        <h2 className="text-3xl font-bold text-white-900">📂 Categorías</h2>

        <div className="flex flex-wrap gap-3">
          {categories.map((c: any) => (
            <a
              key={c.category_id}
              href={`/category/${c.category_id}`}
              className="px-5 py-2 rounded-lg bg-white shadow hover:shadow-md border hover:border-gray-300 transition text-gray-800 font-medium"
            >
              {c.name}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
