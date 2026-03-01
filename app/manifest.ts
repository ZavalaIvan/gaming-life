import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zen Ludico",
    short_name: "ZenLudico",
    description: "Gamifica rutinas de pareja con XP, rachas, monedas y retos.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f7fbf6",
    theme_color: "#f7fbf6",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  };
}
