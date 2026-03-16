import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stracaganass WebApp",
  description: "Eventi, notizie e link utili della guggen Stracaganass.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
