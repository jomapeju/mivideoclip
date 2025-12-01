"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api.service";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import zxcvbn from "zxcvbn";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();

  // ===============================
  // PASSWORD STRENGTH CALCULATION
  // ===============================
  const strength = password ? zxcvbn(password) : null;
  const score = strength?.score ?? 0;

  const strengthText = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"][score];
  const strengthColor = ["red", "orange", "yellow", "blue", "green"][score];

  const strengthClass = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][score];

  // ===============================
  // SUBMIT
  // ===============================
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    if (!executeRecaptcha) {
      setError("No se pudo inicializar reCAPTCHA.");
      return;
    }

    const recaptchaToken = await executeRecaptcha("register");

    try {
      const payload = { username, email, password, recaptchaToken };
      await api.post("/auth/register", payload);

      setSuccess(
        "Registro completado. Te hemos enviado un email para verificar tu cuenta. Debes activarla antes de poder iniciar sesión."
      );

      setTimeout(() => router.push("/login"), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudo registrar.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {success && (
        <p className="p-3 mb-4 bg-green-100 text-green-700 border border-green-300 rounded">
          {success}
        </p>
      )}

      {/* USERNAME */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de usuario
        </label>

        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre"
            className="bg-transparent border-none outline-none flex-1 ml-2 text-gray-900"
          />
        </div>
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>

        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email..."
            className="bg-transparent border-none outline-none flex-1 ml-2 text-gray-900"
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>

        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-transparent border-none outline-none flex-1 ml-2 text-gray-900"
          />
        </div>

        {/* PASSWORD STRENGTH BAR */}
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs">
              <span className={`font-semibold text-${strengthColor}-600`}>
                {strengthText}
              </span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className={`h-2 rounded transition-all duration-300 ${strengthClass}`}
                style={{ width: `${(score + 1) * 20}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
}
