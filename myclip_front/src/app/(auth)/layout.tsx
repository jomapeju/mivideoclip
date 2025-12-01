import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 relative px-4">

      {/* ← Volver al inicio */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-slate-300 hover:text-white transition text-sm font-medium flex items-center gap-1"
      >
        ← Volver al inicio
      </Link>

      {/* Contenido del formulario */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        {children}
      </div>
    </main>
  );
}
