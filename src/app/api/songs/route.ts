import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";
import { getDiverseSongs } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);
  if (!tokenResult) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const language = request.nextUrl.searchParams.get("language") || "english";
  const countParam = request.nextUrl.searchParams.get("count");
  const count = countParam ? Math.min(Math.max(parseInt(countParam), 10), 35) : 20;

  try {
    const songs = await getDiverseSongs(tokenResult.access_token, language, count);
    const response = NextResponse.json({ songs });
    return applyRefreshedCookie(response, tokenResult);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
