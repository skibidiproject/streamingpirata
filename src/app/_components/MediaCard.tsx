"use client"
import MediaType from "./MediaType"


export default function MediaCard({ID}: {ID: string})
{
    const mediaID = "112"
   
    return(
        <button className="relative overflow-hidden border-2 border-[#090909] shadow-2xl transition-all duration-300 text-xs flex flex-col text-left justify-end h-[15rem] w-[10rem] rounded-xl mt-8 p-4 group flex-shrink-0">
           
            <div className="absolute inset-0 bg-cover bg-center bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.coverwhiz.com%2Fuploads%2Ftv%2Fstranger-things-season-2.jpg&f=1&nofb=1&ipt=0ae6fcc4c77da32048a1e7a8565f2c5ee29ee558a69f92af56e02a69e2a32a61')] transition-transform duration-500 scale-120 group-hover:scale-100"></div>
           
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-[#00000035]"></div>
           
            <div className="relative z-10 font-bold">
                <h1 className="text-[1rem]">media name: {mediaID}</h1>
                <div className="flex flex-row gap-x-1 items-center">
                    <h1>release year: {mediaID}</h1>
                    <span className="text-gray-400">|</span>
                    <h1>media type: {mediaID}</h1>
                </div>
            </div>
        </button>
    )
}