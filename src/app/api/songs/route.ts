import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { getDiverseSongs } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const token = await getValidAccessToken(request);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const language = request.nextUrl.searchParams.get("language") || "english";
  const countParam = request.nextUrl.searchParams.get("count");
  const count = countParam ? Math.min(Math.max(parseInt(countParam), 10), 35) : 20;

  try {
    const songs = await getDiverseSongs(token, language, count);
    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
