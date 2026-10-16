import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";
import { getPlaylistTracks, getPlaylistFromEmbed, fillPreviewUrls } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const playlistId = request.nextUrl.searchParams.get("playlistId");
  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlistId" }, { status: 400 });
  }

  const tokenResult = await getValidAccessToken(request);

  if (tokenResult) {
    try {
      const tracks = await getPlaylistTracks(tokenResult.access_token, playlistId);
      if (tracks.length > 0) {
        const response = NextResponse.json({ tracks });
        return applyRefreshedCookie(response, tokenResult);
      }
    } catch (error) {
      // Development Mode returns 403 for users outside the allowlist and for
      // playlists the user does not own; fall through to the embed scraper.
      console.error("Web API playlist fetch failed, trying embed fallback:", error);
    }
  }

  try {
    const { tracks: embedTracks } = await getPlaylistFromEmbed(playlistId);
    const tracks = await fillPreviewUrls(embedTracks, playlistId);
    const response = NextResponse.json({ tracks });
    return tokenResult ? applyRefreshedCookie(response, tokenResult) : response;
  } catch (error) {
    console.error("Failed to fetch playlist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
