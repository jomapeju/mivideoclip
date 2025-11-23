
export async function getClientUser(
  apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
) {
  const res = await fetch(`${apiBase}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function loginClient(
  email: string,
  password: string,
  apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
) {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    credentials: 'include', // crucial para cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Login failed');

  return body.user;
}
