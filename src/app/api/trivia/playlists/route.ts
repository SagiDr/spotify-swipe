import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";
import { getUserPlaylists } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);
  if (!tokenResult) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const playlists = await getUserPlaylists(tokenResult.access_token);
    const filtered = playlists.filter((p) => p.trackCount >= 4);
    const response = NextResponse.json({ playlists: filtered });
    return applyRefreshedCookie(response, tokenResult);
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
