// src/services/logout.ts
export async function logout(apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
  await fetch(`${apiBase}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  // redirigir a login:
  if (typeof window !== 'undefined') window.location.href = '/login';
}
