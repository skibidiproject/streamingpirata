import Navbar from "../_components/NavBar";
import Footer from "../_components/Footer";

export default function disclaimer() {
    return (
        <>
            <Navbar />
            <main className="px-6 md:px-12 mt-8 md:mt-16 text-white max-w-screen-lg mx-auto">
                <h1 className="text-2xl md:text-6xl lg:text-8xl font-bold mb-6">Disclaimer</h1>

                <div className="text-base md:text-lg leading-relaxed">
                    <p className="mb-4">
                        Il presente sito web (di seguito, "il Sito") non ospita direttamente alcun contenuto audiovisivo, né file video, né flussi multimediali (streaming), né tantomeno archivi di qualsiasi natura protetti da diritto d’autore. Tutti i contenuti visibili sul Sito sono collegamenti (link), embed o riferimenti a fonti esterne, liberamente disponibili su Internet e accessibili pubblicamente da servizi terzi.
                    </p>
                    <p className="mb-4">
                        Il Sito funge esclusivamente da aggregatore e indicizzatore di contenuti già presenti online, fornendo agli utenti un’interfaccia semplificata per accedere a risorse multimediali distribuite da piattaforme esterne. Non abbiamo alcun controllo diretto sul contenuto, la qualità, la disponibilità o la legalità del materiale offerto tramite tali fonti terze.
                    </p>
                    <p className="mb-4">
                        I nostri sistemi non ospitano, salvano, trasmettono o distribuiscono direttamente alcun file protetto da copyright. L’intera infrastruttura del Sito si limita a facilitare l’accesso a contenuti già disponibili altrove, per mezzo di tecnologie come l’incorporamento (embedding) e l'indirizzamento tramite URL pubblici.
                    </p>
                    <p className="mb-4">
                        Effettuiamo unicamente una verifica tecnica e formale dei collegamenti indicizzati (per verificarne il corretto funzionamento e la fruibilità), ma non possiamo in alcun modo essere ritenuti responsabili per la natura, l’accuratezza, la legittimità, la disponibilità o la qualità dei contenuti stessi. Qualora uno o più collegamenti facciano riferimento a materiale ritenuto non conforme alle normative vigenti (ad esempio, lesivo dei diritti d’autore), vi invitiamo a contattarci tramite l’apposita sezione di segnalazione: ci impegneremo a rimuovere tempestivamente il riferimento contestato.
                    </p>
                    <p className="mb-4">
                        In quanto intermediario tecnico, il Sito agisce secondo i principi della neutralità della rete e nel rispetto del D.Lgs. 70/2003, della Direttiva sul commercio elettronico (2000/31/CE) e della normativa internazionale vigente in materia. Ogni responsabilità relativa all’utilizzo improprio delle risorse da parte degli utenti è interamente a carico dell’utilizzatore finale, che si assume l’onere di verificare la liceità dell’accesso ai contenuti tramite fonti esterne.
                    </p>

                    <div className="text-right mt-10 pr-2">
                        <small className="text-sm italic">
                            I gestori della piattaforma,<br />03/07/2025
                        </small>
                    </div>
                </div>

            </main>

            <Footer />
        </>
    )
}