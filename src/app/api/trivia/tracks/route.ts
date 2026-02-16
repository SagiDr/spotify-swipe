import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";
import { getPlaylistTracks } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);
  if (!tokenResult) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const playlistId = request.nextUrl.searchParams.get("playlistId");
  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlistId" }, { status: 400 });
  }

  try {
    const tracks = await getPlaylistTracks(tokenResult.access_token, playlistId);
    const response = NextResponse.json({ tracks });
    return applyRefreshedCookie(response, tokenResult);
  } catch (error) {
    console.error("Failed to fetch playlist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
