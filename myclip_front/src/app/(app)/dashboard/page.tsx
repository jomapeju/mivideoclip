// MYCLIP_FRONT/src/app/(app)/dashboard/page.tsx

import Link from "next/link";
import { VideoList } from "../../../components/VideoList";
import { getServerUser } from "../../../lib/server/getServerUser";
import {
  UserCircleIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  const user = await getServerUser();

  // Fallback (middleware ya redirige)
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No autenticado</h2>
        <Link
          href="/login"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto space-y-12">

        {/* -------------------------------- */}
        {/* 🧑‍🎤 HEADER DE USUARIO */}
        {/* -------------------------------- */}
        <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col md:flex-row justify-between gap-6">

          {/* USER INFO */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <UserCircleIcon className="w-10 h-10 text-blue-600" />
              {user.username || user.email}
            </h1>

            <p className="text-gray-600 text-sm">
              Bienvenido a tu panel de creador. Gestiona tus videos, consulta estadísticas y participa en concursos.
            </p>
          </div>

          {/* AVATAR */}
          <div className="flex justify-start md:justify-end">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-3xl shadow-inner">
              {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* 🎬 MIS VIDEOS */}
        {/* -------------------------------- */}
        <section className="space-y-6">
          <header className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <VideoCameraIcon className="w-7 h-7 text-gray-700" />
              Tus videoclips
            </h2>

            <Link
              href="/upload"
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md font-semibold hover:bg-green-700 transition"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              Subir Video
            </Link>
          </header>

          <VideoList />
        </section>

      </div>
    </div>
  );
}
