// src/app/(app)/upload/page.tsx
import React from "react";
import { UploadForm } from "../../../components/UploadForm";
import { getServerUser } from "../../../lib/server/getServerUser";
import { redirect } from "next/navigation";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";

export default async function UploadPage() {
  // SSR Auth check
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-3">
          <ArrowUpTrayIcon className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Subir Video</h1>
            <p className="text-gray-600 mt-1">
              Completa los datos del videoclip y selecciona hasta 4 categorías.
            </p>
          </div>
        </div>

        {/* Tarjeta */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
