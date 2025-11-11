import type { Metadata } from "next";
import "./globals.css"; // Asegúrate de tener este archivo o crea uno vacío.

export const metadata: Metadata = {
  title: "MyVideoClip",
  description: "Tu plataforma de videoclips",
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
