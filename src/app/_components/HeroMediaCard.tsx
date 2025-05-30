import PlayButton from "./PlayButton"
import TrailerButton from "./TrailerButton"
import PegiRating from "./PegiRating"
import ReleaseYear from "./ReleaseYear"
import SeasonsAmount from "./SeasonsAmount"
import MediaName from "./MediaName"

export default function HeroMediaCard()
{
    const mediaID = "12312"
    return(
        <div className="flex flex-col justify-center gap-y-3  text-5xl     w-full h-[30rem] bg-cover bg-center bg-[linear-gradient(rgba(10,10,10,0.1),rgba(10,10,10,1)),url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.hdqwalls.com%2Fwallpapers%2Fstranger-things-season-2-xe.jpg&f=1&nofb=1&ipt=40b2bbc8e7c873fcadba377013364cbc33270e614e195a0655904ee92d67ea85')] text-white p-8">
            
            <MediaName ID={mediaID} />

            <div className="flex flex-row gap-x-5 text-xl">
                <PegiRating ID={mediaID}/>
                <ReleaseYear ID={mediaID} />
                <SeasonsAmount ID={mediaID} />
            </div>
            <h1 className="text-xl font-medium w-[25rem] md:w-[50rem]">Quando un ragazzo scompare misteriosamente, la sua città scopre creature terrificanti e segreti governativi.</h1>

            <div className="flex flex-row gap-x-4 text-lg mt-4">
                <PlayButton
                    ID={mediaID} />
                <TrailerButton
                    ID={mediaID} />
            </div> 

        </div>
    )
}