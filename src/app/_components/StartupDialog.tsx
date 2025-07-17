'use client'
import { Button } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const HIDE_KEY = 'hideWelcomeModalUntil'

export default function MyModal() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(HIDE_KEY)
    if (saved) {
      const hideUntil = parseInt(saved, 10)
      const now = Date.now()
      setIsOpen(now > hideUntil) // mostra solo se la data è passata
    } else {
      setIsOpen(true) // nessuna preferenza salvata, mostra il modal
    }
  }, [])

  function close() {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300)
  }

  function handleDontShowAgain() {
    const twelveHoursFromNow = Date.now() + 1 * 60 * 60 * 1000 // 1 ora in ms
    localStorage.setItem(HIDE_KEY, twelveHoursFromNow.toString())
    close()
  }

  function openBanner() {
    const twelveHoursFromNow = Date.now() + 24 * 60 * 60 * 1000 // 24 ore in ms
    localStorage.setItem(HIDE_KEY, twelveHoursFromNow.toString())
    router.push('/info')
  }

  if (isOpen === null) return null
  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 sm:right-4 z-35 pointer-events-none flex">
      <div
        className={`
          w-[95%] mx-auto sm:w-full max-w-md rounded-xl bg-[#0a0a0a]/80 border border-zinc-800 p-6 backdrop-blur-2xl 
          transition-all duration-300 ease-in-out pointer-events-auto
          ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        <h3 className="text-base font-medium text-white">
          Benvenuto su Streaming ITA 🇮🇹
        </h3>
        <p className="mt-2 text-sm text-white/50">
          Aiutaci a mantenere questo servizio completamente gratuito e senza pubblicità. Se apprezzi il nostro lavoro, considera una donazione per sostenere i costi di mantenimento e sviluppo.
        </p>
        <div className="mt-4 flex gap-x-2">
          <Button
            className="inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-semibold text-black cursor-pointer"
            onClick={openBanner}
          >
            Supporta il Progetto
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded bg-[#404040] px-3 py-1.5 text-sm font-semibold text-white cursor-pointer "
            onClick={handleDontShowAgain}
          >
            Non ora
          </Button>
        </div>
      </div>
    </div>
  )
}
