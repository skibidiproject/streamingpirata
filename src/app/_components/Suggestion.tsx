    "use client";
    import { MediaData } from "./Mediadata";
    import { useState, useEffect } from "react";

    interface suggestionsProps {
        query: string;
    }

    export default function Suggetions({ query }: suggestionsProps) {
        const [suggestions, setSuggestions] = useState<MediaData[]>([]);

        useEffect(() => {
            const fetchSuggestions = async () => {
                const urlParams = new URLSearchParams();
                urlParams.append("search", query);
                urlParams.append("limit", "5")

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/?${urlParams.toString()}`,
                    { cache: "no-store" }
                );

                
                const data = await res.json();
                
                setSuggestions(data.data || []);
            };

            fetchSuggestions();
        }, [query]);

        console.log(suggestions)

        return (
            <div className={`absolute mt-8 h-fit w-full bg-[#0a0a0a]/85 border border-[#2e2e2e] border-t-transparent rounded-br-md rounded-bl-md ${suggestions.length === 0 ? "hidden" : ""} `}>
                {suggestions.map((item) => (
                    <a href={`/media/${item.type}/${item.id}`} key={item.id} >
                        <div className="px-5 py-1 hover:underline">
                            <h1 className="truncate">{item.title}</h1>
                        </div>
                    </a>
                ))}
            </div>
        );
    }