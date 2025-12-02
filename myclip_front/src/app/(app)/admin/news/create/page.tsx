import AdminNewsForm from "../../../../../components/news/AdminNewsForm";

export default function CreateNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Crear noticia
          </h1>
          <p className="text-sm text-gray-600">
            Publica un nuevo aviso, actualización o anuncio para la comunidad.
          </p>
        </header>

        <AdminNewsForm mode="create" />
      </div>
    </div>
  );
}
