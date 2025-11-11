import { VideoList } from '../../../components/VideoList';
import Link from 'next/link';

export default function DashboardPage() {
  // El control de autenticación lo dejamos en el layout o en un wrapper
  // pero el componente VideoList se encarga de manejar la carga de datos.
  
  return (
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
  );
}
