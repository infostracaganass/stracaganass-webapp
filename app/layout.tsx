import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "StracApp",
  description: "Eventi, notizie e link utili a portata di mano.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />

        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />

        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "dbcc4574-fe7f-4dc2-ac5a-0d3babdfa9b3",
                safari_web_id: "web.onesignal.auto.57daeefd-2777-4d55-aef6-93b3ff4b973a",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
