import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";
import { getSearchBasedRecommendations } from "@/lib/spotify";
import { Track } from "@/types";

export async function POST(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);
  if (!tokenResult) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { likedTracks } = (await request.json()) as {
      likedTracks: Track[];
    };

    if (!likedTracks || likedTracks.length === 0) {
      return NextResponse.json(
        { error: "No liked tracks provided" },
        { status: 400 }
      );
    }

    const recommendations = await getSearchBasedRecommendations(tokenResult.access_token, likedTracks);

    const response = NextResponse.json({ tracks: recommendations });
    return applyRefreshedCookie(response, tokenResult);
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
