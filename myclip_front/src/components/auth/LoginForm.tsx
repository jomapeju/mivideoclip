'use client';

import React, { useState } from 'react';
import api from '../../services/api.service';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('auth/login', { email, password });
      
      const token = response.data.access_token;
      
      // 1. Almacenar el JWT en una Cookie para persistencia y seguridad
      // IMPORTANTE: En producción, usarías HttpOnly cookies (solo backend puede escribir)
      Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'Strict' });
      
      // 2. Redirigir al dashboard protegido
      router.push('/dashboard'); 

    } catch (err: any) {
      // Manejar errores de credenciales inválidas (401)
      const errorMessage = err.response?.data?.message || 'Error de conexión. Inténtelo de nuevo.' || email || ' grtgrgt';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded"
          required 
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded"
          required 
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Login
      </button>
    </form>
  );
};