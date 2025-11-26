import React from "react";
import Header from "../../components/Header";
import { getServerUser } from "../../lib/server/getServerUser";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
