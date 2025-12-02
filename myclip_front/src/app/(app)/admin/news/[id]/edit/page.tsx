import AdminNewsForm, {
  AdminNewsPost,
} from "../../../../../../components/news/AdminNewsForm";

type PageProps = {
  params: { id: string };
};

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const res = await fetch(`${apiBase}/news/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Noticia no encontrada
          </h1>
          <p className="text-sm text-gray-600">
            Es posible que haya sido eliminada.
          </p>
          <a
            href="/admin/news"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver al panel de noticias
          </a>
        </div>
      </div>
    );
  }

  const data = await res.json();

  const initialData: AdminNewsPost = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    excerpt: data.excerpt,
    content: data.content,
    isPublished: data.isPublished,
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar noticia
          </h1>
          <p className="text-sm text-gray-600">
            Modifica el contenido o la visibilidad de esta noticia.
          </p>
        </header>

        <AdminNewsForm mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}
