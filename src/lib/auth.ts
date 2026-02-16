import { NextRequest, NextResponse } from "next/server";
import { SpotifyTokens } from "@/types";

const COOKIE_NAME = "spotify_tokens";

export function encodeTokens(tokens: SpotifyTokens): string {
  return Buffer.from(JSON.stringify(tokens)).toString("base64");
}

export function decodeTokens(encoded: string): SpotifyTokens {
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
}

export function getTokensFromRequest(request: NextRequest): SpotifyTokens | null {
  const tokenCookie = request.cookies.get(COOKIE_NAME);
  if (!tokenCookie) return null;
  try {
    return decodeTokens(tokenCookie.value);
  } catch {
    return null;
  }
}

export interface TokenResult {
  access_token: string;
  refreshed_tokens?: SpotifyTokens; // Set when tokens were refreshed (so cookie can be updated)
}

export async function getValidAccessToken(request: NextRequest): Promise<TokenResult | null> {
  const tokens = getTokensFromRequest(request);
  if (!tokens) return null;

  // If token is still valid (with 60s buffer), return it
  if (Date.now() < tokens.expires_at - 60000) {
    return { access_token: tokens.access_token };
  }

  // Token expired, try to refresh
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const newTokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    return { access_token: data.access_token, refreshed_tokens: newTokens };
  } catch {
    return null;
  }
}

/** Attach updated token cookie to a response if tokens were refreshed */
export function applyRefreshedCookie(response: NextResponse, tokenResult: TokenResult): NextResponse {
  if (tokenResult.refreshed_tokens) {
    response.cookies.set(COOKIE_NAME, encodeTokens(tokenResult.refreshed_tokens), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}
