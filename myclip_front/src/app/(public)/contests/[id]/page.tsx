// myclip_front/src/app/(public)/contests/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getServerUser } from '../../../../lib/server/getServerUser';
import ContestDetailClient from '../../../../components/ContestDetailClient';
import type { Contest, ContestVideoParticipant } from '../../../../lib/video.types';

type PageProps = {
  params: { id: string };
};

export default async function ContestDetailPage({ params }: PageProps) {
  const { id } = params;

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // SSR: concurso + ranking + usuario
  const [user, contestRes, rankingRes] = await Promise.all([
    getServerUser(apiBase),
    fetch(`${apiBase}/contests/${id}`, { cache: 'no-store' }),
    fetch(`${apiBase}/contests/${id}/ranking`, { cache: 'no-store' }),
  ]);

  if (!contestRes.ok) {
    return notFound();
  }

  const contest: Contest = await contestRes.json();
  const ranking: ContestVideoParticipant[] = rankingRes.ok
    ? await rankingRes.json()
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900">
        Concurso: {contest.title}
      </h1>
      <p className="text-gray-600 max-w-3xl">{contest.description}</p>

      <ContestDetailClient
        contest={contest}
        initialRanking={ranking}
        isAuthenticated={!!user}
      />
    </div>
  );
}
