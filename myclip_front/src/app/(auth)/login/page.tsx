import { LoginForm } from "../../../components/auth/LoginForm";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

        <div className="flex items-center gap-3 mb-6">
          <ArrowRightStartOnRectangleIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">Iniciar sesión</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Accede a tu cuenta para gestionar tus videoclips.
        </p>

        <LoginForm />

        <p className="mt-6 text-sm text-gray-600 text-center">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-blue-600 font-semibold hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
