import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StracApp",
  description: "Eventi, notizie e link utili a portata di mano.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
