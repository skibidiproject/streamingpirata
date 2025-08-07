import Link from "next/link";
import { Button } from "@headlessui/react";

export default function Footer() {
  return (
    <footer className="w-full text-center mt-12 border-t-1 border-t-[#212121]">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-6">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-sm">
            Ogni contributo, anche piccolo, ci aiuta a mantenere il servizio attivo e gratuito per tutti.
          </h1>
        </div>
        <Link href="/info">
          <Button
            className="inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-semibold text-black cursor-pointer sm:mb-0 mb-4 sm:mr-4"
          >
            Supporta il Progetto
          </Button>
        </Link>
      </div>
    </footer>
  );
}
