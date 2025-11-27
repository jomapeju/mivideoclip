import Link from "next/link";
import { getServerUser } from "../../lib/server/getServerUser";
import LogoutButton from "./LogoutButton";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default async function Header() {
  const user = await getServerUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="app-container flex h-16 items-center justify-between gap-4 px-4">

        {/* ======================================================= */}
        {/* 🔥 LOGO + HOME */}
        {/* ======================================================= */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-red-500 shadow-soft transition group-hover:scale-105">
            <span className="text-sm font-bold text-white">MC</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white">
              My<span className="text-brand-primary">Clip</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Videoclips, concursos y rankings
            </span>
          </div>
        </Link>

        {/* ======================================================= */}
        {/* 🔍 BUSCADOR (solo desktop) */}
        {/* ======================================================= */}
        <div className="hidden md:flex flex-1 max-w-md">
          <form action="/search" className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              name="q"
              placeholder="Buscar videos o canciones…"
              className="w-full rounded-full border border-slate-700 bg-slate-900/70 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 
                focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition"
            />
          </form>
        </div>

        {/* ======================================================= */}
        {/* 📌 MENÚ DERECHO */}
        {/* ======================================================= */}
        <nav className="flex items-center gap-3 text-sm">

          {/* Enlaces visibles para todos */}
          <Link
            href="/rankings"
            className="hidden sm:inline-flex rounded-full border border-slate-700 px-3 py-1 
              text-xs font-medium text-slate-200 hover:border-brand-primary hover:text-brand-primary transition"
          >
            Rankings
          </Link>

          <Link
            href="/contests"
            className="hidden sm:inline-flex rounded-full border border-purple-500/50 bg-purple-500/10 px-3 py-1 
              text-xs font-medium text-purple-200 hover:bg-purple-500/20 transition"
          >
            Concursos
          </Link>

          {/* ======================================================= */}
          {/* 🔐 Si NO hay usuario */}
          {/* ======================================================= */}
          {!user && (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-100 
                  hover:border-brand-primary transition"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="hidden sm:inline-flex rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold 
                  text-white shadow-soft hover:bg-red-500 transition"
              >
                Crear cuenta
              </Link>
            </>
          )}

          {/* ======================================================= */}
          {/* 👤 Si hay usuario */}
          {/* ======================================================= */}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-xs font-medium 
                  text-slate-100 hover:bg-slate-700 transition"
              >
                Mi zona
              </Link>

              <Link
                href="/upload"
                className="hidden md:inline-flex rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold 
                  text-white shadow-soft hover:bg-red-500 transition"
              >
                Subir vídeo
              </Link>

              {/* 🔴 Botón logout (client component) */}
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
