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



    return <div className="w-[80%] sm:w-[52%] mx-auto rounded-lg p-3 backdrop-blur-sm h-[5rem]">
        <div className="flex flex-row items-center w-full justify-between h-full">
            <div className="flex flex-row h-full items-center gap-2">
                <CryptoIcon symbol={symbol} className="aspect-square h-[75%]" />
                <div className="flex flex-col justify-center">
                    <h3 className="text-white font-medium text-sm md:text-base text-left">{name}</h3>
                    <code className="text-stone-300 text-xs font-mono truncate block max-w-[120px] md:max-w-[175px] lg:max-w-[200px] xl:max-w-[300px]">
                        {address}
                    </code>
                </div>
            </div>
            {copiedWallet === symbol ? (
                <div className="gap-1 text-green-500 text-xs font-medium aspect-square h-full flex justify-center items-center">
                    <Check size={14} />
                </div>
            ) : (
                <button
                    onClick={() => copyToClipboard(address, symbol)}
                    className="text-stone-300 hover:text-white transition-colors cursor-pointer aspect-square h-full flex justify-center items-center"
                    aria-label={`Copia indirizzo ${name}`}
                >
                    <Copy size={16} />
                </button>
            )}
        </div>
    </div>



}