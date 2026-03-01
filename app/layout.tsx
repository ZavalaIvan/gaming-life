import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import { AppShell } from "@/components/AppShell";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit"
});

export const metadata: Metadata = {
  title: "Zen Ludico",
  description: "Rutinas en pareja gamificadas para sesiones diarias de menos de 60 segundos.",
  applicationName: "Zen Ludico",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zen Ludico"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: "/icons/apple-touch-icon.svg",
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#f7fbf6",
  initialScale: 1,
  width: "device-width",
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="zenludico">
      <body className={outfit.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
