'use client';

import { useState, useEffect } from 'react';

export default function PlayerLoader() {
  const [dots, setDots] = useState('');
  const [message, setMessage] = useState('Preparazione del contenuto');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const messageInterval = setInterval(() => {
      setMessage(prev => {
        switch (prev) {
          case 'Preparazione del contenuto':
            return 'Ricerca dello stream';
          case 'Ricerca dello stream':
            return 'Configurazione del player';
          case 'Configurazione del player':
            return 'Quasi pronto';
          case 'Quasi pronto':
            return 'Preparazione del contenuto';
          default:
            return 'Preparazione del contenuto';
        }
      });
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Spinner animato */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-stone-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500  border-t-transparent animate-spin"></div>
        </div>
        
        {/* Messaggio principale */}
        <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">
          {message}{dots}
        </h2>
        
        {/* Messaggio secondario */}
        <p className="text-gray-400 text-sm md:text-base mb-6">
          Stiamo preparando il tuo contenuto, ci vorrà solo un momento
        </p>

      </div>
    </div>
  );
}