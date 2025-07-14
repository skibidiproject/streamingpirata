'use client'
import { Button } from '@headlessui/react'
import { useEffect, useState } from 'react'

export default function MyModal() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const hidden = localStorage.getItem('hideWelcomeModal')
    setIsOpen(hidden !== 'true')
  }, [])

  function close() {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300)
  }

  function handleDontShowAgain() {
    localStorage.setItem('hideWelcomeModal', 'true')
    close()
  }

  function openBanner() {
    console.log('Apri info o banner...')
  }

  if (isOpen === null) return null // non mostrare nulla finché non abbiamo letto le preferenze
  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div
        className={`
          w-full max-w-md rounded-xl bg-[#0a0a0a]/70 border border-zinc-800 p-6 backdrop-blur-2xl 
          transition-all duration-300 ease-in-out pointer-events-auto
          ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        <h3 className="text-base font-medium text-white">
          Benvenuto su PEZZ8!
        </h3>
        <p className="mt-2 text-sm text-white/50">
          Siamo una piattaforma di streaming pirata, senza annunci, quindi dona cazzo se non vuoi le pubblicità!
        </p>
        <div className="mt-4 flex gap-x-2">
          <Button
            className="inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-100 transition-colors"
            onClick={openBanner}
          >
            Maggiori informazioni
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded bg-[#303030] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#404040] transition-colors"
            onClick={handleDontShowAgain}
          >
            Non mostrare più
          </Button>
        </div>
      </div>
    </div>
  )
}