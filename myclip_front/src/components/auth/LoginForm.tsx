'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginClient } from "../../lib/auth";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import api from "../../services/api.service";

export const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setLoading(true);

    try {
      await loginClient(email, password, process.env.NEXT_PUBLIC_API_URL);
      router.push("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al iniciar sesión";

      // Detectar el mensaje EXACTO del backend
      if (msg.includes("sin verificar")) {
        setNeedsVerification(true);
        setError("Tu correo está sin verificar. Revisa tu email para activarlo.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (cooldown > 0) return;

    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) clearInterval(timer);
        return c - 1;
      });
    }, 1000);

    try {
      await api.post("/auth/resend-verification", { email });
      setError("📩 Te enviamos un nuevo correo de verificación.");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al reenviar correo."
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="bg-transparent border-none outline-none flex-1 ml-2 text-gray-900"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
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
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* Reenviar correo de verificación */}
      {needsVerification && (
        <div className="mt-3 text-center">
          <p className="text-gray-600 text-sm mb-2">
            ¿No recibiste el correo de activación?
          </p>

          <button
            type="button"
            onClick={resendVerification}
            disabled={cooldown > 0}
            className={`text-blue-600 underline font-medium ${
              cooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : "Reenviar email de verificación"}
          </button>
        </div>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Accediendo..." : "Entrar"}
      </button>
    </form>
  );
};
