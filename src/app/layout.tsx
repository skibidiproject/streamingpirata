import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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

        {/* Definisce window.plausible */}
        <Script id="plausible-init" strategy="beforeInteractive">
          {`
          window.plausible = window.plausible || function() { 
            (window.plausible.q = window.plausible.q || []).push(arguments) 
          }
        `}
        </Script>

        {/* Carica lo script esterno */}
        <Script
          src="https://analytics.fuckcopyright.net/js/script.file-downloads.hash.outbound-links.pageview-props.tagged-events.js"
          strategy="afterInteractive"
          data-domain="ondemand.fuckcopyright.net"
          defer
        />

        {children}
      </body>
    </html>
  );
}
