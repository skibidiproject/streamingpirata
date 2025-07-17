'use client'

import Crypto, { Wallets } from '../_components/Crypto'
import Navbar from '../_components/NavBar'



export default function Donations() {



  return (
    <>
      <Navbar />
      <div className="text-white px-4 py-8 mt-25 w-screen">
        <div className="mx-auto w-[20rem] sm:w-[30rem] md:w-[40rem] lg:w-[55rem]  text-center">
          <div className="text-white px-4 py-8 mt-25 w-screen">
            <div className="mx-auto w-[20rem] sm:w-[30rem] md:w-[40rem] lg:w-[55rem]  text-center">

              <h1 className="text-2xl md:text-3xl font-bold mb-4 ">Supporta il Progetto</h1>
              <p className="  text-white text-sm mb-6 px-2">
                Il ruolo della nostra piattaforma è puramente tecnico e automatizzato. I flussi video presenti non significano che i contenuti siano stati caricati, approvati o esaminati direttamente da noi. I nostri server si limitano a fare da “ponte” tecnico (transit o proxy), senza conservare i file in modo permanente.
              </p>
              <p className="  text-white text-sm mb-6 px-2">
                Gestire un servizio così richiede risorse importanti: dai costi di banda, ai server, fino allo sviluppo e alla manutenzione continua. Nonostante questo, abbiamo deciso di mantenere il sito gratuito e senza pubblicità, perché vogliamo che chiunque possa usarlo liberamente e senza distrazioni.
              </p>
              <p className="  text-white text-sm  mb-6 px-2">
                Aiutaci a mantenere questo servizio completamente gratuito e senza pubblicità.
                Se apprezzi il nostro lavoro, considera una donazione per sostenere
                i costi di mantenimento e sviluppo.
              </p>

              <div className="space-y-3 px-2">
                {Wallets.map((wallet) => (
                  <Crypto name={wallet.name} address={wallet.address} symbol={wallet.symbol} key={wallet.symbol} />
                ))}
              </div>

              <p className="text-white mt-6 px-2">
                Ogni contributo, anche piccolo, ci aiuta a mantenere il servizio attivo e gratuito per tutti.
              </p>

              <div className='w-full flex items-center justify-center '>
                <img src="./Car/Car.jpg" className='mt-15 aspect-auto h-[20rem]  ' />
              </div>

              <p className="text-white mt-6 px-2">Dexter ringrazia</p>

              <h1 className='italic mt-[5rem] md:mt-[5rem] lg:mt-[5rem] xl:mt-[4rem] text-2xl font-bold mb-5'>"Culture shouldn't exist only for those who can afford it"</h1>


            </div>
          </div>
        </div>
      </div>
    </>
  )
}