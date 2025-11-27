import { getServerUser } from "../../lib/server/getServerUser";
import VideoGrid from "../../components/VideoGrid";
import type { Contest } from "../../lib/video.types";

export const revalidate = 60; // revalidar cada 60 segundos

export default async function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const [categoriesRes, latestRes, popularRes, contestsRes] = await Promise.all([
    fetch(`${apiBase}/videos/categories`, { cache: "no-store" }),
    fetch(`${apiBase}/videos`, { cache: "no-store" }),
    fetch(`${apiBase}/videos/popular`, { cache: "no-store" }),
    fetch(`${apiBase}/contests`, {
      cache: "force-cache",
      next: { revalidate: revalidate },
    }),
  ]);

  const categories = await categoriesRes.json();
  const latest = await latestRes.json();
  const popular = await popularRes.json();
  const contests: Contest[] = contestsRes.ok ? await contestsRes.json() : [];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Videos Recientes</h1>
      <VideoGrid videos={latest} />

      <h2 className="text-2xl font-semibold">Populares</h2>
      <VideoGrid videos={popular} />

      {/* 🔥 Sección nuevos concursos */}
      <h2 className="text-2xl font-semibold">Concursos Activos</h2>
      <div className="flex flex-wrap gap-4">
        {contests.length === 0 && (
          <p className="text-gray-500">No hay concursos en este momento.</p>
        )}
        {contests.map((c) => (
          <a
            key={c.contest_id}
            href={`/contests/${c.contest_id}`}
            className="bg-white border shadow-sm rounded-md px-5 py-4 max-w-sm hover:bg-gray-100 transition"
          >
            <p className="font-bold text-gray-900">{c.title}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {c.description}
            </p>

            {/* Badge */}
            <span
              className={`mt-2 inline-block px-2 py-1 text-xs rounded-full font-semibold ${
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

      <h2 className="text-2xl font-semibold">Categorías</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((c: any) => (
          <a
            key={c.category_id}
            href={`/category/${c.category_id}`}
            className="bg-white shadow px-4 py-2 rounded-md hover:bg-gray-200"
          >
            {c.name}
          </a>
        ))}
      </div>
    </div>
  );
}
