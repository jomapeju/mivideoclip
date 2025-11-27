import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-7xl font-extrabold text-brand-primary drop-shadow mb-4">
        404
      </h1>

      <p className="text-slate-300 text-xl mb-8">
        Oops... La página que buscas no existe.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-brand-primary text-white font-semibold text-sm rounded-xl shadow-soft hover:bg-red-600 transition"
      >
        Volver al inicio
      </Link>

      <p className="text-slate-500 text-xs mt-6">
        ¿Crees que esto es un error? Puedes buscar contenido en la barra superior.
      </p>
    </div>
  );
}
