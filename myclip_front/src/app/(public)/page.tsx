import { getServerUser } from "../../lib/server/getServerUser";
import  VideoGrid  from "../../components/VideoGrid";

export default async function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const [categoriesRes, latestRes, popularRes] = await Promise.all([
    fetch(`${apiBase}/videos/categories`, { cache: "no-store" }),
    fetch(`${apiBase}/videos`, { cache: "no-store" }),
    fetch(`${apiBase}/videos/popular`, { cache: "no-store" }),
  ]);

  const categories = await categoriesRes.json();
  const latest = await latestRes.json();
  const popular = await popularRes.json();

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Videos Recientes</h1>
      <VideoGrid videos={latest} />

      <h2 className="text-2xl font-semibold">Populares</h2>
      <VideoGrid videos={popular} />

      <h2 className="text-2xl font-semibold">Categorías</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((c: any) => (
          <a key={c.category_id}
             href={`/category/${c.category_id}`}
             className="bg-white shadow px-4 py-2 rounded-md hover:bg-gray-200">
            {c.name}
          </a>
        ))}
      </div>
    </div>
  );
}
