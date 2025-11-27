"use client";

import RegisterForm from "../../../components/auth/RegisterForm";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

        <div className="flex items-center gap-3 mb-6">
          <UserPlusIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">Crear cuenta</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Regístrate para subir videoclips, comentar y participar en concursos.
        </p>

        <RegisterForm />

        <p className="mt-6 text-sm text-gray-600 text-center">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
