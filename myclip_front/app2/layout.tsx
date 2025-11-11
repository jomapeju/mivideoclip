import type { Metadata } from "next";
import "./globals.css"; // Asegúrate de tener este archivo o crea uno vacío.

export const metadata: Metadata = {
  title: "MyVideoClip en APP2",
  description: "Tu plataforma de videoclips en app2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
