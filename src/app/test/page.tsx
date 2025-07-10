import LazyLoader from "../_components/LazyLoader";
import { MediaData } from "../_components/Mediadata";


export default function Home( ) {
    const m: MediaData = {
        id: "1",
        title: "Some Title",
        description: "Some Description",
        poster_url: "/poster.jpg",
        backdrop_url: null,
        logo_url: "/logo.png",
        trailer_url: "https://trailer.example.com",
        release_date: "2025-01-01",
        certification: "PG-13",
        type: "movie"
    };

    
    return (
        <LazyLoader mediaData={[m]} />
    )
    
}