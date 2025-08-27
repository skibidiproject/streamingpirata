import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

async function buildPlayerUrl(type: string, id: string, season: number | null, episode: number | null) {
  const vixBaseUrl = process.env.VIXSRC_BASE_URL;
  if (type === "movie") {
    return `${vixBaseUrl}/movie/${id}?lang=it`;
  } else if (type === "tv" && season && episode) {
    return `${vixBaseUrl}/tv/${id}/${season}/${episode}?lang=it`;
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { type: string; id: string, season: number, episode: number } }) {
  const { type, id, season, episode } = params;

  const destination = await buildPlayerUrl(type, id, season, episode);
  if (!destination) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const proxyPayload = {
    mediaflow_proxy_url: process.env.MEDIAFLOW_BASE_URL,
    endpoint: "/extractor/video",
    destination_url: destination,
    query_params: {
      host: "VixCloud",
      redirect_stream: "true",
    },
    api_password: process.env,
    response_headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  };


  const proxyResponse = await fetch(`${process.env.MEDIAFLOW_BASE_URL}/generate_url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(proxyPayload),
  });

  console.log(JSON.stringify(proxyPayload));

  const result = await proxyResponse.json();

  return NextResponse.json(result);
}
