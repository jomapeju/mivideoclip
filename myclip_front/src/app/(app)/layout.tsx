import React from 'react';
import type { Metadata } from "next";
import Header from '../../components/Header';

export const metadata: Metadata = {
  title: "MyVideoClip",
  description: "Tu plataforma de videoclips",
};

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
        <Header />
        <main className="mt-4">{children}</main>
      </div>
  );
}
