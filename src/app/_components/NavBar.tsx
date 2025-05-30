import Search from "./Search"

export default function NavBar(){
    return (
        <>
        <div id="NavBar" className="width-full bg-[#000000] h-[4rem] flex flex-row items-center justify-between p-5">

            <div className="flex flex-row gap-x-7 h-[3rem] items-center">
                <img src="/logo.jpeg" alt="Logo" className="h-full"/>
                <a href="#" className="hover:underline">Home</a>
                <a href="#" className="hover:underline">Film</a>
                <a href="#" className="hover:underline">Serie TV</a>
            </div>

            <Search/>
        </div>

        <hr className="text-[#212121]"/>  
        </>
    )
}