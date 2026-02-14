import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { getSearchBasedRecommendations } from "@/lib/spotify";
import { Track } from "@/types";

export async function POST(request: NextRequest) {
  const token = await getValidAccessToken(request);
  if (!token) {
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

    const recommendations = await getSearchBasedRecommendations(token, likedTracks);

    return NextResponse.json({ tracks: recommendations });
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
