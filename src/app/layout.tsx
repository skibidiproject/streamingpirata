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
    title: 'Cinema - FuckCopyright Network',
    description: "Streaming di film e serie TV in italiano, gratis!",
    icons: {
      icon: '/favicon.ico',
    },
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
          data-domain={process.env.NEXT_PUBLIC_BASE_DOMAIN}
          src={`${process.env.NEXT_PUBLIC_ANALYTICS_BASE_URL}/js/script.js`}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}