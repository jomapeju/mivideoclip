// MYCLIP_FRONT/src/app/(public)/contests/page.tsx

import Link from "next/link";
import type { Contest } from "../../../lib/video.types";

export default async function ContestsListPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const res = await fetch(`${apiBase}/contests`, { cache: "no-store" });
  const contests: Contest[] = res.ok ? await res.json() : [];

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900">Concursos</h1>
        <p className="text-gray-600">Participa con tus videoclips y compite por los primeros puestos.</p>
      </header>

      {/* Empty state */}
      {contests.length === 0 && (
        <p className="text-gray-500 text-lg">No hay concursos disponibles por el momento.</p>
      )}

      {/* Listado */}
      <ul className="space-y-4">
        {contests.map((c) => (
          <li
            key={c.contest_id}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center border border-gray-100 hover:shadow-md transition"
          >
            <div className="space-y-1">
              <p className="text-xl font-semibold text-gray-900">{c.title}</p>

              <p className="text-sm text-gray-600">
                {new Date(c.start_date).toLocaleDateString()} –{" "}
                {new Date(c.end_date).toLocaleDateString()}
              </p>

              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-semibold ${statusColors[c.status]}`}
              >
                {c.status}
              </span>
            </div>

            <Link
              href={`/contests/${c.contest_id}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Ver detalles →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
