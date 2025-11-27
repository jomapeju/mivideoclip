'use client';

import Link from "next/link";

export default function GlobalError({ error, reset }: any) {
  console.error("⚠️ Global error:", error);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-extrabold text-red-500 drop-shadow mb-4">
        Algo salió mal
      </h1>

      <p className="text-slate-300 mb-8 max-w-md">
        Ha ocurrido un error inesperado. Intenta volver a cargar la página.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Reintentar
        </button>

        <Link
          href="/"
          className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-red-600 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
