// MYCLIP_FRONT/src/app/(public)/contests/[id]/page.tsx

import { notFound } from "next/navigation";
import { getServerUser } from "../../../../lib/server/getServerUser";
import ContestDetailClient from "../../../../components/ContestDetailClient";
import type { Contest, ContestVideoParticipant } from "../../../../lib/video.types";

export default async function ContestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // SSR parallel fetch
  const [user, contestRes, rankingRes] = await Promise.all([
    getServerUser(apiBase),
    fetch(`${apiBase}/contests/${id}`, { cache: "no-store" }),
    fetch(`${apiBase}/contests/${id}/ranking`, { cache: "no-store" }),
  ]);

  if (!contestRes.ok) return notFound();

  const contest: Contest = await contestRes.json();
  const ranking: ContestVideoParticipant[] = rankingRes.ok ? await rankingRes.json() : [];

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

      {/* ---------------------- */}
      {/* Breadcrumb */}
      {/* ---------------------- */}
      <div className="text-sm text-gray-500">
        <a href="/" className="hover:underline">Inicio</a> /{" "}
        <a href="/contests" className="hover:underline">Concursos</a> /{" "}
        <span className="text-gray-700 font-medium">{contest.title}</span>
      </div>

      {/* ---------------------- */}
      {/* Hero / Header del concurso */}
      {/* ---------------------- */}
      <section className="bg-white rounded-xl shadow p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold text-gray-900">{contest.title}</h1>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[contest.status]}`}
          >
            {contest.status}
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed max-w-3xl">
          {contest.description}
        </p>

        <div className="text-sm text-gray-600 mt-4">
          <p><strong>Inicio:</strong> {new Date(contest.start_date).toLocaleDateString()}</p>
          <p><strong>Fin:</strong> {new Date(contest.end_date).toLocaleDateString()}</p>
        </div>
      </section>

      {/* ---------------------- */}
      {/* Client Component (votaciones, ranking, inscripciones...) */}
      {/* ---------------------- */}
      <ContestDetailClient
        contest={contest}
        initialRanking={ranking}
        isAuthenticated={!!user}
      />
    </div>
  );
}
