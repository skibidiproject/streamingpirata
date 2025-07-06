import Navbar from "../_components/NavBar";
import Footer from "../_components/Footer";

export default function Disclaimer() {
    return (
        <>
            <Navbar />
            <main className="px-4 md:px-12 mt-8 md:mt-16 text-white max-w-screen-lg mx-auto">
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6">Disclaimer</h1>

                <div className="text-base md:text-lg leading-relaxed">
                    <p className="mb-4">
                        Il presente sito web (di seguito, “il Sito”) non ospita, memorizza o produce direttamente alcun contenuto audiovisivo. Tutti i materiali accessibili tramite il Sito sono flussi provenienti da fonti terze pubblicamente disponibili su Internet, su cui i gestori della piattaforma non esercitano alcun controllo né responsabilità.
                    </p>
                    <p className="mb-4">
                        Il Sito si limita a fornire un’interfaccia tecnica che consente l’accesso a tali contenuti mediante meccanismi automatizzati, come l’aggregazione, l’instradamento o la transcodifica temporanea. I flussi video, ove presenti, sono ridistribuiti tramite sistemi tecnici (es. proxy, cache, stream adapter) al solo fine di garantirne la compatibilità e la fruibilità con i dispositivi degli utenti.
                    </p>
                    <p className="mb-4">
                        Non esiste da parte del Sito alcuna attività di moderazione, selezione, modifica, controllo editoriale o pubblicazione diretta del contenuto. L’intero processo di distribuzione è automatico e non interviene in alcun modo sul contenuto originale, che resta di esclusiva responsabilità dei fornitori terzi da cui proviene.
                    </p>
                    <p className="mb-4">
                        L’utente che accede e utilizza i flussi distribuiti tramite il Sito è il solo responsabile della propria attività e del rispetto delle normative locali, nazionali e internazionali in materia di diritto d’autore. Il Sito non fornisce alcuna garanzia circa la liceità, la disponibilità o la conformità dei contenuti accessibili, e non può essere ritenuto responsabile in caso di accesso a materiale protetto o soggetto a restrizioni.
                    </p>
                    <p className="mb-4">
                        Il ruolo del Sito è puramente tecnico e automatizzato. La presenza di determinati flussi video non implica in alcun modo che tali contenuti siano stati caricati, approvati o analizzati dai gestori della piattaforma. I server del Sito svolgono una funzione di passaggio tecnico (transit o proxy) senza conservare in modo permanente alcun file.
                    </p>
                    <p className="mb-4">
                        In nessun caso il Sito potrà essere considerato responsabile per usi impropri, illeciti o non autorizzati effettuati da terze parti o da utenti finali. I gestori della piattaforma non accettano richieste di rimozione, contestazioni o notifiche, non essendo titolari né responsabili dei contenuti indicizzati o distribuiti.
                    </p>
                    <p className="mb-4">
                        Ai sensi del D.Lgs. 70/2003 e della Direttiva 2000/31/CE, il Sito si configura esclusivamente come fornitore di servizi della società dell’informazione, operando in regime di neutralità, automatismo e assenza di conoscenza effettiva dei contenuti trasmessi.
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