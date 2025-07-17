'use client'
import { useState } from "react"
import { Copy, Check } from 'lucide-react'

const CryptoIcon = ({ symbol, className }: { symbol: string, className: string }) => (
    <img
        src={`/crypto-icons/${symbol.toLowerCase()}.svg`}
        alt={`${symbol} icon`}
        className={className}
    />
)


interface Wallet {
    name: string,
    symbol: string,
    address: string
}


export const Wallets = [
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


export default function Crypto({ name, symbol, address }: Wallet) {

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



    return <div className="w-[90%] sm:w-[80%] md:w-[65%] lg:w-[52%] mx-auto rounded-lg p-3 backdrop-blur-sm h-auto min-h-[5rem]">
    <div className="flex flex-row items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
            <CryptoIcon symbol={symbol} className="aspect-square h-10 sm:h-[2.5rem]" />
            <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-white font-medium text-sm md:text-base text-left truncate">{name}</h3>
                <code className="text-stone-300 text-xs font-mono truncate block max-w-[150px] sm:max-w-[175px] md:max-w-[200px] lg:max-w-[300px]">
                    {address}
                </code>
            </div>
        </div>
        {copiedWallet === symbol ? (
            <div className="text-green-500 text-xs font-medium flex justify-center items-center h-8 w-8 sm:h-10 sm:w-10">
                <Check size={14} />
            </div>
        ) : (
            <button
                onClick={() => copyToClipboard(address, symbol)}
                className="text-stone-300 hover:text-white transition-colors cursor-pointer h-8 w-8 sm:h-10 sm:w-10 flex justify-center items-center"
                aria-label={`Copia indirizzo ${name}`}
            >
                <Copy size={16} />
            </button>
        )}
    </div>
</div>




}