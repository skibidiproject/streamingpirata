import Navbar from "../_components/NavBar";
import Footer from "../_components/Footer";

export default function disclaimer() {
    return (
        <>
            <Navbar />
                <div className="mx-auto w-[85%] p-12 pl-45 m-24 text-red-600 font-bold text-8xl animate-pulse">
                    ⚠ DISCLAIMER ⚠
                    <div className="p-2 pl-45 text-[18px]">
                        <small>Tutti i contenuti SkibidiStreaming non sono proprietari.</small>
                    </div>
                </div>
                
            <Footer />
        </>
    )
}