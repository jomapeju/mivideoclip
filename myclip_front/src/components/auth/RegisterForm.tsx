"use client";

import React, { useState } from 'react';
import api from '../../services/api.service';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('users', { email, password, name });
      // Redirigir al login después de un registro exitoso
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'No se pudo completar el registro. Inténtelo de nuevo.';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear Cuenta</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded"
          required 
        />
      </div>
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
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;
