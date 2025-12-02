import AdminNewsList from "../../../../components/news/AdminNewsList";

export default async function AdminNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de noticias
            </h1>
            <p className="text-sm text-gray-600">
              Crea y gestiona las noticias que se muestran en la portada y en la sección pública.
            </p>
          </div>

          <a
            href="/admin/news/create"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            + Nueva noticia
          </a>
        </header>

        <AdminNewsList />
      </div>
    </div>
  );
}
