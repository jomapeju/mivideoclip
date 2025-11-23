import { VideoList } from '../../../components/VideoList';
import { getServerUser } from '../../../lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) {
    // Si llegó aquí, middleware ya debería haber redirigido, pero como fallback:
    return (
      <div>
        <h2>No autenticado</h2>
        <a href="/(auth)/login">Ir a Login</a>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Bienvenido {user.email}</h1>
      <p>ID: {user.id}</p>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">Mis Videoclips</h1>
                <Link 
                    href="/upload" 
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
                >
                    + Subir Nuevo Video
                </Link>
            </header>

            <VideoList />
          </div>
        </div>
    </div>
  );
}
