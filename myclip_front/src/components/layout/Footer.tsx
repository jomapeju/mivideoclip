export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="app-container py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-sm">

        {/* Left side */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-pink-500 shadow-soft">
            <span className="text-sm font-bold text-white">MC</span>
          </div>
          <p className="text-slate-400">
            © {new Date().getFullYear()} <span className="text-white font-semibold">MyClip</span>.  
            Todos los derechos reservados.
          </p>
        </div>

        {/* Right side */}
        <nav className="flex flex-wrap gap-4 text-slate-400">
          <a href="/legal" className="hover:text-white transition-colors">Aviso legal</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacidad</a>
          <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
          <a href="/contact" className="hover:text-white transition-colors hidden sm:inline-block">Contacto</a>
        </nav>
      </div>
    </footer>
  );
}