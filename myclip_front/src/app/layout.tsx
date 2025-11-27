import type { Metadata } from "next";
import "./globals.css"; 

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
      <body className="app-shell">{children}</body>
    </html>
  );
}
