// src/app/(app)/upload/page.tsx
import React from 'react';
import { UploadForm } from '../../../components/UploadForm'; // cambia a default export si es necesario
import { getServerUser } from '../../../lib/server/getServerUser';
import { redirect } from 'next/navigation';

export default async function UploadPage() {
  // Validación server-side: opcional (middleware ya protege)
  const user = await getServerUser(); // server helper (ver más abajo)
  if (!user) {
    // doble garantía: si no hay sesión se redirige
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Gestión de Subidas</h1>
        {/* UploadForm es un Client Component */}
        <UploadForm />
      </div>
    </div>
  );
}
