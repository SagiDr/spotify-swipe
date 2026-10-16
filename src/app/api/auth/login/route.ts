import { NextRequest, NextResponse } from "next/server";
import {
  PKCE_COOKIE,
  isValidClientId,
  createVerifier,
  challengeFromVerifier,
  encodePkce,
} from "@/lib/pkce";

export async function GET(request: NextRequest) {
  // A user-supplied Client ID means the user logs in through their own
  // Spotify developer app (PKCE, no secret), so the Development Mode
  // allowlist of our app does not apply to them.
  const userClientId = request.nextUrl.searchParams.get("client_id");
  if (userClientId !== null && !isValidClientId(userClientId)) {
    return NextResponse.redirect(new URL("/?error=invalid_client_id", request.url));
  }

  const clientId = userClientId ?? process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
  ].join(" ");

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    show_dialog: "true",
  });

  if (!userClientId) {
    const response = NextResponse.redirect(
      `https://accounts.spotify.com/authorize?${params}`
    );
    response.cookies.set(PKCE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  const verifier = createVerifier();
  params.set("code_challenge_method", "S256");
  params.set("code_challenge", challengeFromVerifier(verifier));

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  );
  response.cookies.set(
    PKCE_COOKIE,
    encodePkce({ verifier, client_id: userClientId, state }),
    { path: "/", maxAge: 600, httpOnly: true, sameSite: "lax", secure: redirectUri.startsWith("https") }
  );
  return response;
}
