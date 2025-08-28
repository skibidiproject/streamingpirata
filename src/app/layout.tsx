import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  return {
    title: 'FuckCopyright Network - On Demand',
    description: "L'unica piattaforma italiana di streaming gratuito e senza pubblicità. Che cazzo di più? Mettiti seduto e prendi i popcorn! 🍿",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased overflow-x-hidden`}
      >
        <Script
          defer
          data-domain="ondemand.fuckcopyright.net"
          src="https://analytics.fuckcopyright.net/js/script.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}