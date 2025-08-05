'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Search from "./Search";
import { useAuth } from "@/app/hooks/useAuth";

interface Props {
  accountCenterBaseUrl: string
}


function Navbar({ accountCenterBaseUrl }: Props) {
  const { user, isLoggedIn, loading, refetch } = useAuth(); 
  console.log(user, isLoggedIn, loading)
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? '' : 'hidden';
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Funzione per determinare se un link è attivo
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Classi per link attivo e non attivo
  const getLinkClasses = (path: string) => {
    const baseClasses = "px-2 rounded py-0.5 transition-all duration-300";
    const activeClasses = "text-glow-sm";
    const inactiveClasses = "";

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };


  const [showLogin, setShowLogin] = useState(false);


  return (
    <>
      <header className={`fixed z-50 duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md shadow-md' : 'bg-transparent'} w-screen text-white px-5 md:px-8 lg:px-8 py-4.5`}>
        <div className="flex  justify-between items-center  md:gap-12">

          <div className="flex justify-center gap-x-10">

            <Link href="/">
              <img src="/logo.png" alt="Logo" className="w-30 h-auto" />
            </Link>


            {/* Menu link (desktop only) */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={getLinkClasses('/')}>Home</Link>
              <Link href="/film" className={getLinkClasses('/film')}>Film</Link>
              <Link href="/serie-tv" className={getLinkClasses('/serie-tv')}>Serie TV</Link>
              <Link href="/archivio" className={getLinkClasses('/archivio')}>Archivio</Link>
              {

                  !loading && (isLoggedIn && user ? (
                    <Link href="/account" className="bg-white text-black px-4 py-1 rounded hover:cursor-pointer">Account</Link>
                  ) : (
                    <a
                      href={`${accountCenterBaseUrl}/login?redirect=ondemand`}
                      className="bg-white text-black px-4 py-1 rounded hover:cursor-pointer">
                      Login
                    </a>
                  ))
              }
            </nav>

          </div>

          {/* Search (desktop) */}
          <div className=" md:float-end " suppressHydrationWarning>
            <Search />
          </div>



          {/* Hamburger */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 focus:outline-none flex-shrink-0"
          >
            {!menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </button>


        </div>

      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 bg-black text-white z-40 flex flex-col items-center justify-center space-y-8 text-3xl transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
          }`}
      >
        <ul className="text-center space-y-6">
          <li>
            <Link href="/" onClick={closeMenu} className="hover:underline">Home</Link>
          </li>
          <li>
            <Link href="/film" onClick={closeMenu} className="hover:underline">Film</Link>
          </li>
          <li>
            <Link href="/serie-tv" onClick={closeMenu} className="hover:underline">Serie TV</Link>
          </li>
          <li>
            <Link href="/archivio" onClick={closeMenu} className="hover:underline">Archivio</Link>
          </li>
          <li>
            <a href={`${accountCenterBaseUrl}/login?redirect=ondemand`}>Login</a>
          </li>
        </ul>
      </div>

      <hr className="text-[#212121]" />
    </>
  );
}

export default Navbar;