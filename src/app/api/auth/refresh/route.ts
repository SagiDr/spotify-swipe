import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, applyRefreshedCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);
  if (!tokenResult) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const response = NextResponse.json({ access_token: tokenResult.access_token });
  return applyRefreshedCookie(response, tokenResult);
}
