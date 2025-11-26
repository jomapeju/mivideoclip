'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../services/api.service';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; user_id: string } | null>(null);

  useEffect(() => {
    // Obtener usuario logueado vía cookie HttpOnly
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me', { withCredentials: true });
        setUser(res.data.user);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      router.push('/');
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">
        MyClip
      </Link>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Mi zona
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Iniciar sesión
            </Link>
            <Link href="/register" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
