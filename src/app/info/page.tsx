'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Navbar from '../_components/NavBar'

const CryptoIcon = ({ symbol }: { symbol: string }) => (
  <img
    src={`/crypto-icons/${symbol.toLowerCase()}.svg`}
    alt={`${symbol} icon`}
    className="w-6 h-6 md:w-8 md:h-8"
  />
)

export default function Donations() {
  const wallets = [
    {
      name: 'Bitcoin',
      symbol: 'btc',
      address: 'bc1q42p4ryl0qlhh0clvrhyqym7qgucleqmlf3uycc',
    },
    /*
    {
      name: 'Monero',
      symbol: 'xmr',
      address: 'walleet',
    },
    */
  ]

  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)

  const copyToClipboard = async (text: string, walletSymbol: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedWallet(walletSymbol)
      setTimeout(() => setCopiedWallet(null), 2000)
    } catch (err) {
      console.error('Errore nella copia:', err)
    }
  }

  return (
    <>
      <Navbar />
      <div className="text-white px-4 md:px-8 py-8 md:py-16 mt-24 sm:mt-14">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">Supporta il Progetto</h1>
          <p className="text-center text-white text-sm md:text-base mb-6 px-2">
            Il ruolo della nostra piattaforma è puramente tecnico e automatizzato. I flussi video presenti non significano che i contenuti siano stati caricati, approvati o esaminati direttamente da noi. I nostri server si limitano a fare da “ponte” tecnico (transit o proxy), senza conservare i file in modo permanente.
          </p>
          <p className="text-center text-white text-sm md:text-base mb-6 px-2">
            Gestire un servizio così richiede risorse importanti: dai costi di banda, ai server, fino allo sviluppo e alla manutenzione continua. Nonostante questo, abbiamo deciso di mantenere il sito gratuito e senza pubblicità, perché vogliamo che chiunque possa usarlo liberamente e senza distrazioni.
          </p>
          <p className="text-center text-white text-sm md:text-base mb-6 px-2">
            Aiutaci a mantenere questo servizio completamente gratuito e senza pubblicità.
            Se apprezzi il nostro lavoro, considera una donazione per sostenere
            i costi di mantenimento e sviluppo.
          </p>

          <div className="space-y-3 px-2">
            {wallets.map((wallet) => (
              <div key={wallet.symbol} className="sm:w-[52%] w-full mx-auto rounded-lg p-3 md:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <CryptoIcon symbol={wallet.symbol} />
                    <div className="min-w-0">
                      <h3 className="text-white font-medium text-sm md:text-base truncate">{wallet.name}</h3>
                      <code className="text-stone-300 text-xs font-mono truncate block w-full">
                        {wallet.address}
                      </code>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {copiedWallet === wallet.symbol ? (
                      <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                        <Check size={14} />
                      </div>
                    ) : (
                      <button
                        onClick={() => copyToClipboard(wallet.address, wallet.symbol)}
                        className="text-stone-300 hover:text-white transition-colors"
                        aria-label={`Copia indirizzo ${wallet.name}`}
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs md:text-sm text-white mt-6 md:mt-8 px-2">
            Ogni contributo, anche piccolo, ci aiuta a mantenere il servizio attivo e gratuito per tutti.
          </p>
        </div>
      </div>
    </>
  )
}