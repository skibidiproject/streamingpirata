export interface MediaData {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string | null;
  logo_url: string;
  trailer_url: string;
  release_date: string;
  rating: number;
  certification: string;
  genres_array: Array<string> ;
  type: "tv" | "movie";
}
