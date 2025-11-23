'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginClient } from '../../lib/auth';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginClient(email, password, process.env.NEXT_PUBLIC_API_URL);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Error al loguear');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto">
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="password" />
      <button type="submit">Entrar</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};