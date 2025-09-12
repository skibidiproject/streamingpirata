'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    loading: true,
  })

  const [error, setError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('https://test.0/api/auth/me', {
        credentials: 'include',
      })
      const data = await response.json()
      console.log(data)
      if (data.isLoggedIn) {
        setAuthState({
          user: data.user,
          isLoggedIn: true,
          loading: false,
        })
      } else {
        setAuthState({
          user: null,
          isLoggedIn: false,
          loading: false,
        })
      }
    } catch (error) {
      console.log(error);
      setAuthState({
        user: null,
        isLoggedIn: false,
        loading: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    setLoginLoading(true)
    setError(null)

    try {
      const res = await fetch('https://test.0/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // fondamentale per cookie cross-domain
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Login fallito')
      }

      await checkAuth()
      return true
    } catch (err: any) {
      setError(err.message || 'Errore imprevisto')
    } finally {
      setLoginLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('https://test.0/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setAuthState({
        user: null,
        isLoggedIn: false,
        loading: false,
      })

      window.location.href = 'https://test.0/login'
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return {
    ...authState,
    error,
    loginLoading,
    login,
    logout,
    refetch: checkAuth,
  }
}
