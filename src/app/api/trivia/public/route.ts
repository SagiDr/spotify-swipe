import { NextRequest, NextResponse } from "next/server";
import { getPlaylistFromEmbed, parsePlaylistId, fillPreviewUrls } from "@/lib/spotify";

// Load any public playlist by link without logging in (unofficial embed scraper)
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("playlist") ?? "";
  const playlistId = parsePlaylistId(input);
  if (!playlistId) {
    return NextResponse.json({ error: "Invalid playlist link" }, { status: 400 });
  }

  try {
    const { summary, tracks: embedTracks } = await getPlaylistFromEmbed(playlistId);
    const tracks = await fillPreviewUrls(embedTracks, playlistId);
    return NextResponse.json({ playlist: summary, tracks });
  } catch (error) {
    console.error("Failed to load public playlist:", error);
    return NextResponse.json(
      { error: "Could not load this playlist. Make sure it is public." },
      { status: 502 }
    );
  }
}
