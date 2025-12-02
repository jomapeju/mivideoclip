import type { Metadata } from "next";

type NewsDetail = {
  id: string;
  title: string;
  slug: string;
  category: "UPDATES" | "CONTESTS" | "RULES" | "OTHER";
  content: string;
  createdAt: string;
};

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  try {
    const res = await fetch(`${apiBase}/news/${params.slug}`, {
      cache: "force-cache",
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return { title: "Noticia no encontrada" };
    }
    const post: NewsDetail = await res.json();
    return {
      title: `${post.title} | Noticias MyClip`,
      description: post.content.slice(0, 160),
    };
  } catch {
    return { title: "Noticia | MyClip" };
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const res = await fetch(`${apiBase}/news/${slug}`, {
    cache: "force-cache",
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Noticia no encontrada
        </h1>
        <p className="text-gray-600 text-sm">
          Es posible que el enlace haya caducado o que la noticia haya sido retirada.
        </p>
      </main>
    );
  }

  const post: NewsDetail = await res.json();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          Publicado el{" "}
          {new Date(post.createdAt).toLocaleDateString("es-ES")}
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">
          {post.title}
        </h1>
      </div>

      <article className="prose max-w-none prose-p:mb-3 prose-headings:mt-6 prose-headings:mb-2">
        {/* De momento tratamos el contenido como texto plano con saltos de línea */}
        {post.content.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </article>

      <div className="pt-4 border-t border-gray-200">
        <a
          href="/news"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          ← Volver a noticias
        </a>
      </div>
    </main>
  );
}
