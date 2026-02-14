import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = await getValidAccessToken(request);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ access_token: token });
}
