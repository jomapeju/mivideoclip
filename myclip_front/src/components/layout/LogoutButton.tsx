"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(
        process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`
          : "http://localhost:3000/api/v1/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:border-red-400 hover:text-red-400"
    >
      Cerrar sesión
    </button>
  );
}
