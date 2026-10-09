import type { Metadata, Viewport } from "next";
import { Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CrisisButton } from "@/app/components/CrisisButton";
import { BrotherhoodAtmosphere } from "@/app/components/BrotherhoodAtmosphere";

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
  appleWebApp: {
    capable: true,
    title: "Brotherhood",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#070908",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="isolate min-h-full flex flex-col">
        <BrotherhoodAtmosphere />
        <CrisisButton />
        {children}
      </body>
    </html>
  );
}
