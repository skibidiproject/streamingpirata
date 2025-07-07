'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import Search from "./Search";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <>
      <header className={`fixed  z-50 duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md shadow-md' : 'bg-transparent'} w-screen text-white px-5 md:px-8 lg:px-8 py-4 `}>

        <div className="flex items-center justify-between md:justify-start md:gap-12">
          
          {/* Logo + hamburger */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/">
              <img src="/logo.png" alt="Logo" className="w-20 h-auto" />
            </Link>
            
            {/* BARRA DI RICERCA MOBILE - MODIFICATA */}
            <div className="md:hidden flex-grow mx-3 max-w-[12rem]">
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

          {/* Menu link (desktop only) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:underline transition-all duration-200">Home</Link>
            <Link href="/film" className="hover:underline transition-all duration-200">Film</Link>
            <Link href="/serie-tv" className="hover:underline transition-all duration-200">Serie TV</Link>
            <Link href="/archivio" className="hover:underline transition-all duration-200">Archivio</Link>
          </nav>

          {/* Search (desktop) */}
          <div className="hidden md:block ml-auto">
            <Search />
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 bg-black text-white z-40 flex flex-col items-center justify-center space-y-8 text-3xl transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
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
        </ul>
      </div>

      <hr className="text-[#212121]"/>
    </>
  );
}

export default Navbar;