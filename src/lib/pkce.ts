import { createHash, randomBytes } from "crypto";

export const PKCE_COOKIE = "spotify_pkce";

export interface PkceState {
  verifier: string;
  client_id: string;
  state: string;
}

// Spotify Client IDs are 32 hex characters
export function isValidClientId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{32}$/i.test(value);
}

export function createVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function challengeFromVerifier(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function encodePkce(pkce: PkceState): string {
  return Buffer.from(JSON.stringify(pkce)).toString("base64url");
}

export function decodePkce(encoded: string | undefined): PkceState | null {
  if (!encoded) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}
