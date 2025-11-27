import Link from 'next/link';
import type { Contest } from '../../../lib/video.types';

export default async function ContestsListPage() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const res = await fetch(`${apiBase}/contests`, { cache: 'no-store' });
  if (!res.ok) {
    return <p className="p-6">No se pudieron cargar los concursos.</p>;
  }
  const contests: Contest[] = await res.json();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Concursos</h1>
      {contests.length === 0 && (
        <p className="text-gray-500">No hay concursos disponibles.</p>
      )}
      <ul className="space-y-3">
        {contests.map((c) => (
          <li
            key={c.contest_id}
            className="bg-white shadow rounded-md p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-900">{c.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(c.start_date).toLocaleDateString()} -{' '}
                {new Date(c.end_date).toLocaleDateString()}
              </p>
            </div>
            <Link
              href={`/contests/${c.contest_id}`}
              className="text-blue-600 underline"
            >
              Ver detalles
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
