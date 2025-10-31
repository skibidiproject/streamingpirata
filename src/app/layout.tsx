import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  return {
    title: 'Streaming - FuckCopyright Network',
    description: "Streaming di film e serie TV in italiano, gratis!",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`${process.env.NEXT_PUBLIC_ANALYTICS_BASE_URL}/script.js`}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${dmSans.variable} antialiased overflow-x-hidden`}
      >
        <NextTopLoader
          color="#155dfc"
          height={2}
          showSpinner={false}
        />
        {children}
      </body>
    </html>
  );
}