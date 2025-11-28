import type { Metadata } from "next";
import "./globals.css";
import ReCaptchaProviderClient from "../components/ReCaptchaProviderClient";

export const metadata: Metadata = {
  title: "MyVideoClip",
  description: "Tu plataforma de videoclips",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="app-shell">
        <ReCaptchaProviderClient>
          {children}
        </ReCaptchaProviderClient>
      </body>
    </html>
  );
}
