import Episode from "./Episode"

export default function EpisodeSelector() {
    return (
        <>
            <hr className="text-[#212121] mb-5" />
            <div className="w-[95%] h-full mx-auto p-3 rounded-2xl">
                <h1 className="text-2xl mb-2">Episodi</h1>
                <div className="">
                    Stagione: <input type="selector" className=""/>
                </div>
                <Episode id="194766" season={1} episode={1}/>
                <Episode id="194766" season={1} episode={2}/>
            </div>
        </>
    )
}