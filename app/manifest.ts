import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Brotherhood Project",
    short_name: "Brotherhood",
    description:
      "A men's wellness community. Rooms, Squads, the Bench, and Daily 3.",
    start_url: "/home",
    display: "standalone",
    background_color: "#F5F0E6",
    theme_color: "#1B3A6B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
