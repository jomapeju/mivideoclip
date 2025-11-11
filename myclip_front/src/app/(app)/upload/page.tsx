'use client';

import { UploadForm } from '../../../components/UploadForm';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Protección de ruta a nivel de frontend (chequea la cookie)
    const token = Cookies.get('auth_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="p-10 text-center">Redirigiendo a Login...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Gestión de Subidas</h1>
        <UploadForm />
      </div>
    </div>
  );
}