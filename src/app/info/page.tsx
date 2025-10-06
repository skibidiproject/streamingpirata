'use client'

import Crypto, { Wallets } from '../_components/Crypto'
import Navbar from '../_components/NavBar'
import Link from 'next/link'


export default function Donations() {


  return (
    <>
      <Navbar />
      <div className="text-white px-4 py-8 w-screen pt-30">
        <div className="mx-auto w-[97%] sm:w-[30rem] md:w-[40rem] lg:w-[55rem]  text-justify">

          <h1 className="text-2xl md:text-3xl font-bold mb-4">Supporta il Progetto</h1>
          <p className="  text-white text-sm mb-6">
            Il ruolo della nostra piattaforma è puramente tecnico e automatizzato. I flussi video presenti non significano che i contenuti siano stati caricati, approvati o esaminati direttamente da noi. I nostri server si limitano a fare da “ponte” tecnico (transit o proxy), senza conservare i file in modo permanente.
          </p>
          <p className="  text-white text-sm mb-6">
            Gestire un servizio così richiede risorse importanti: dai costi di banda, ai server, fino allo sviluppo e alla manutenzione continua. Nonostante questo, abbiamo deciso di mantenere il sito gratuito e senza pubblicità, perché vogliamo che chiunque possa usarlo liberamente e senza distrazioni.
          </p>
          <p className="  text-white text-sm  mb-6">
            Aiutaci a mantenere questo servizio completamente gratuito e senza pubblicità.
            Se apprezzi il nostro lavoro, considera una donazione per sostenere
            i costi di mantenimento e sviluppo.
          </p>

          <div className="space-y-3">
            {Wallets.map((wallet) => (
              <Crypto name={wallet.name} address={wallet.address} symbol={wallet.symbol} key={wallet.symbol} />
            ))}
          </div>

          <p className="text-white mt-6 mb-4  text-sm text-center">
            Ogni contributo, anche piccolo, ci aiuta a mantenere il servizio attivo e gratuito per tutti.
          </p>
          <div className="w-full italic mt-3 text-center">
            <Link href="/info/gestori">
              <small>I gestori della piattaforma</small>
            </Link>
          </div>

          <h1 className="italic mt-10 mb-8 text-2xl text-center">&quot;Culture shouldn&apos;t exist only for those who can afford it&quot;</h1>

        </div>
      </div>
    </>
  )
}