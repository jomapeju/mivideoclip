import { cookies } from "next/headers";

export async function getServerUser(
  apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
) {
  const cookieStore = cookies();
  const cookieString = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${apiBase}/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookieString,
      "cache-control": "no-store",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.user;
}
