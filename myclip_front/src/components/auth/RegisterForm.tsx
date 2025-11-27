"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api.service";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { username, email, password };
      await api.post("/auth/register", payload);

      router.push("/login"); // registro OK → login
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudo registrar.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* USERNAME */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de usuario
        </label>

        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre"
            className="bg-transparent border-none outline-none flex-1 ml-2"
          />
        </div>
      </div>

      {/* EMAIL */}
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
            placeholder="tu@email..."
            className="bg-transparent border-none outline-none flex-1 ml-2"
          />
        </div>
      </div>

      {/* PASSWORD */}
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
            className="bg-transparent border-none outline-none flex-1 ml-2"
          />
        </div>
      </div>

      {/* Error */}
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
