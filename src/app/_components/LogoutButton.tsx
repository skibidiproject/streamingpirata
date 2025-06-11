// components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect alla pagina di login
        router.push('/login');
        router.refresh(); // Forza il refresh per aggiornare lo stato della sessione
      } else {
        console.error('Errore durante il logout');
        alert('Errore durante il logout');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore di connessione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:opacity-50 my-auto text-[1rem]"
    >
      {isLoading ? 'Disconnessione...' : 'Logout'}
    </button>
  );
}
