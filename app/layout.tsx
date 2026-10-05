import type { Metadata, Viewport } from "next";
import { Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CrisisButton } from "@/app/components/CrisisButton";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Brotherhood",
  description: "A men's wellness community. Show up, post honestly, check in daily.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CrisisButton />
        {children}
      </body>
    </html>
  );
}
