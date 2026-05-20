import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matam Media — Noha & Manqabat",
  description: "Nadeem Sarwar, Mir Hasan Mir, Ali Shanawar ke nohay, manqabat aur majalis — sab ek jagah",
  keywords: "noha, manqabat, majlis, nadeem sarwar, mir hasan mir, ali shanawar, karbala, muharram",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
