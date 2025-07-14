import Link from "next/link"
export default function Footer()
{
    return <>
    <div className="w-full text-center h-50 mt-12 mb-8">
      <hr className="text-[#212121]"/>
        <img src="/logo.png" alt="Logo" className="w-32 mx-auto mt-15 text-white"/>
        <small className="text-s">Copyright&copy; 2025 - SuperStream</small>
        <br />
        <small className="text-s mx-2"><Link href="/disclaimer">Disclaimer</Link></small>
        <small className="text-s mx-2"><Link href="/Autori">Autori</Link></small>
    </div>
    </>
}