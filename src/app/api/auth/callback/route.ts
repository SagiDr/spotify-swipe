import { NextRequest, NextResponse } from "next/server";
import { encodeTokens } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    console.error("Token exchange failed:", errText);
    return NextResponse.redirect(new URL("/?error=token_failed", request.url));
  }

  const data = await tokenResponse.json();

  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  const cookieValue = encodeTokens(tokens);

  // Return an HTML page that sets the cookie via meta redirect
  // This ensures the cookie is fully set before navigating to /swipe
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Logging in...</title>
      </head>
      <body style="background:#121212;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
        <p>Logging in...</p>
        <script>
          document.cookie = "spotify_tokens=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax";
          window.location.href = "/swipe";
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
