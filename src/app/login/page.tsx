'use client'
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(formData.username, formData.password);

    if(result.success)
      router.push('/admin');
    else
    {
      setIsLoading(false);
      setError(result.error || "Errore durante il login")
    }
    
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Login card */}
          <div className="rounded-lg p-8 shadow-2xl border-[#191919] border">
            <div className="text-center mb-8">
              <img src="/logo.png" alt="Logo" className='mx-auto mb-6 w-60'/>
              <h2 className="text-2xl font-bold text-white mb-2">Accesso</h2>
              <p className="text-gray-400">Inserisci le tue credenziali per accedere</p>
            </div>

            <div className="space-y-6">
              {/* Username field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-[#191919] rounded-md text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Inserisci username"
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-[#191919] rounded-md text-white placeholder-gray-500 focus:outline-none transition-all"
                  placeholder="Inserisci password"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-50 rounded-md p-3">
                  <p className="text-white text-sm">{error}</p>
                </div>
              )}


              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accesso in corso...
                  </div>
                ) : (
                  'Accedi'
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}