import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matam Media — Noha & Manqabat",
  description: "Nadeem Sarwar, Mir Hasan Mir, Ali Shanawar ke nohay, manqabat aur majalis — sab ek jagah",
  keywords: "noha, manqabat, majlis, nadeem sarwar, Farhan Ali Waris,mir hasan mir, ali Muharram 2026 Nohay Nohay MP3 Download  Urdu Nohay shanawar, karbala, Latest Nohay Islamic Nohay Shia Nohay Muharram 1448 Nohay https://www.nohayonline.com/#gsc.tab=0 nohay online ,punjabi nohay ,nohay ,NohayOnline New Nohay 2026 ,muharram", 
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
