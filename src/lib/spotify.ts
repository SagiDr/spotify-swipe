import { SpotifyTrack, Track, SpotifyUser, SpotifyPlaylist, PlaylistSummary } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch(endpoint: string, token: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per request

  try {
    const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${text}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function formatTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: track.album.images[0]?.url ?? "",
    previewUrl: track.preview_url ?? null,
    uri: track.uri,
    spotifyUrl: track.external_urls.spotify,
  };
}

// Use Search API to get diverse songs since Recommendations API is deprecated
// Mix of popular artist searches and genre queries for better quality results
const ENGLISH_QUERIES = [
  // Pop
  "artist:Taylor Swift", "artist:Dua Lipa", "artist:The Weeknd", "artist:Billie Eilish",
  "artist:Harry Styles", "artist:Olivia Rodrigo", "artist:Sabrina Carpenter", "artist:Chappell Roan",
  // Hip-Hop / Rap
  "artist:Drake", "artist:Kendrick Lamar", "artist:Travis Scott", "artist:21 Savage",
  "artist:SZA", "artist:Tyler the Creator", "artist:Metro Boomin",
  // Rock / Alternative
  "artist:Arctic Monkeys", "artist:Tame Impala", "artist:Imagine Dragons", "artist:Hozier",
  "artist:Radiohead", "artist:Foo Fighters",
  // R&B / Soul
  "artist:Frank Ocean", "artist:Daniel Caesar", "artist:Doja Cat", "artist:Beyonce",
  // Electronic / Dance
  "artist:Fred again", "artist:Calvin Harris", "artist:Disclosure",
  // Latin
  "artist:Bad Bunny", "artist:Peso Pluma", "artist:Karol G",
  // Indie
  "artist:Phoebe Bridgers", "artist:Mitski", "artist:Clairo", "artist:Mac DeMarco",
  // Genre mix for variety
  "top hits 2025", "viral hits 2024", "best new music 2025",
  "genre:jazz year:2020-2026", "genre:country year:2023-2026",
  "genre:classical year:2020-2026", "genre:metal year:2022-2026",
];

const HEBREW_QUERIES = [
  // Popular Israeli artists
  "artist:עידן רייכל", "artist:אריאל זילבר", "artist:שלמה ארצי",
  "artist:עומר אדם", "artist:נועה קירל", "artist:אייל גולן",
  "artist:סטטיק ובן אל תבורי", "artist:אגם בוחבוט", "artist:מרגול",
  "artist:ישי ריבו", "artist:עדן חסון", "artist:נתן גושן",
  "artist:אביב גפן", "artist:שרית חדד", "artist:אתניקס",
  "artist:תומר יוסף", "artist:הדג נחש", "artist:בלקן ביט בוקס",
  "artist:ריקלין", "artist:מוש בן ארי",
  // Genre queries in Hebrew
  "שירים ישראליים חדשים 2025",
  "להיטים ישראליים",
  "מוזיקה מזרחית חדשה",
  "ראפ ישראלי חדש",
  "רוק ישראלי",
  "פופ ישראלי 2024",
];

const MIN_POPULARITY = 40; // Filter out obscure tracks

function hasHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getDiverseSongs(token: string, language: string = "english", maxCount: number = 20): Promise<Track[]> {
  const tracks: Track[] = [];
  const seenIds = new Set<string>();
  const artistCounts = new Map<string, number>();
  const seenAlbums = new Set<string>();
  const isHebrew = language === "hebrew";

  const allQueries = isHebrew ? HEBREW_QUERIES : ENGLISH_QUERIES;
  // Pick a random subset of queries so each session feels different
  const queries = shuffle(allQueries).slice(0, Math.max(maxCount, 15));

  // Process queries in parallel batches of 5 to avoid rate limiting while staying fast
  const BATCH_SIZE = 5;
  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    if (tracks.length >= maxCount) break;

    const batch = queries.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (query) => {
        const offset = Math.floor(Math.random() * (isHebrew ? 20 : 50));
        const params = new URLSearchParams({
          q: query,
          type: "track",
          limit: "10",
          offset: offset.toString(),
        });
        if (isHebrew) params.set("market", "IL");

        return spotifyFetch(`/search?${params}`, token);
      })
    );

    for (const result of results) {
      if (tracks.length >= maxCount) break;
      if (result.status !== "fulfilled") continue;

      const data = result.value;
      if (data.tracks?.items) {
        // Only take 1 track per query to maximize diversity across artists
        let addedFromQuery = false;
        for (const track of data.tracks.items as SpotifyTrack[]) {
          if (addedFromQuery || seenIds.has(track.id) || tracks.length >= maxCount) continue;

          // Skip low-popularity tracks
          // (Client IDs created after February 2026 no longer receive popularity)
          if (track.popularity !== undefined && track.popularity < MIN_POPULARITY) continue;

          // For Hebrew mode, only include tracks with Hebrew in the name or artist
          // For English mode, reject tracks with Hebrew characters
          const trackName = track.name;
          const artistNames = track.artists.map((a) => a.name).join(" ");
          if (isHebrew) {
            if (!hasHebrew(trackName) && !hasHebrew(artistNames)) continue;
          } else {
            if (hasHebrew(trackName) || hasHebrew(artistNames)) continue;
          }

          // Max 1 song per artist
          const mainArtist = track.artists[0]?.name ?? "";
          if ((artistCounts.get(mainArtist) ?? 0) >= 1) continue;

          // Max 1 song per album
          const albumId = track.album.id;
          if (seenAlbums.has(albumId)) continue;

          seenIds.add(track.id);
          seenAlbums.add(albumId);
          artistCounts.set(mainArtist, (artistCounts.get(mainArtist) ?? 0) + 1);
          tracks.push(formatTrack(track));
          addedFromQuery = true;
        }
      }
    }
  }

  // Shuffle the final result so genres/artists are mixed together
  return shuffle(tracks);
}

// Generate recommendations using Search API based on liked artists
export async function getSearchBasedRecommendations(
  token: string,
  likedTracks: Track[]
): Promise<Track[]> {
  const tracks: Track[] = [];
  const seenIds = new Set<string>(likedTracks.map((t) => t.id));

  // Extract unique artists from liked tracks
  const artists = Array.from(new Set(likedTracks.map((t) => t.artist.split(", ")[0])));

  // Search for more tracks by liked artists
  for (const artist of artists.slice(0, 8)) {
    if (tracks.length >= 40) break;

    try {
      const offset = Math.floor(Math.random() * 10);
      const params = new URLSearchParams({
        q: `artist:"${artist}"`,
        type: "track",
        limit: "10",
        offset: offset.toString(),
      });

      const data = await spotifyFetch(`/search?${params}`, token);

      if (data.tracks?.items) {
        for (const track of data.tracks.items as SpotifyTrack[]) {
          if (!seenIds.has(track.id) && tracks.length < 40) {
            seenIds.add(track.id);
            tracks.push(formatTrack(track));
          }
        }
      }
    } catch (e) {
      console.error(`Failed to search for artist "${artist}":`, e);
    }
  }

  // If we still need more tracks, search by genre-like terms from the liked tracks
  if (tracks.length < 40) {
    const fillerQueries = [
      "top hits 2024",
      "popular songs 2025",
      "best new music",
      "trending songs",
    ];

    for (const query of fillerQueries) {
      if (tracks.length >= 40) break;

      try {
        const offset = Math.floor(Math.random() * 20);
        const params = new URLSearchParams({
          q: query,
          type: "track",
          limit: "10",
          offset: offset.toString(),
        });

        const data = await spotifyFetch(`/search?${params}`, token);

        if (data.tracks?.items) {
          for (const track of data.tracks.items as SpotifyTrack[]) {
            if (!seenIds.has(track.id) && tracks.length < 40) {
              seenIds.add(track.id);
              tracks.push(formatTrack(track));
            }
          }
        }
      } catch (e) {
        console.error(`Failed to search for "${query}":`, e);
      }
    }
  }

  return tracks;
}

export async function getUserProfile(token: string): Promise<SpotifyUser> {
  return spotifyFetch("/me", token);
}

export async function createPlaylist(
  token: string,
  userId: string,
  name: string,
  description: string
): Promise<SpotifyPlaylist> {
  const body = JSON.stringify({ name, description, public: false });
  try {
    // February 2026 replacement for POST /users/{id}/playlists
    return await spotifyFetch("/me/playlists", token, { method: "POST", body });
  } catch {
    return spotifyFetch(`/users/${userId}/playlists`, token, { method: "POST", body });
  }
}

export async function getUserPlaylists(token: string): Promise<PlaylistSummary[]> {
  const playlists: PlaylistSummary[] = [];
  let url = "/me/playlists?limit=50";

  while (url) {
    const data = await spotifyFetch(url, token);
    for (const item of data.items ?? []) {
      playlists.push({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0]?.url ?? "",
        // Renamed from "tracks" to "items" in the February 2026 API changes
        trackCount: item.tracks?.total ?? item.items?.total ?? 0,
      });
    }
    url = data.next ? data.next.replace("https://api.spotify.com/v1", "") : "";
  }

  return playlists;
}

async function scrapePlaylistPreviews(playlistId: string): Promise<Map<string, string>> {
  const previews = new Map<string, string>();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!res.ok) return previews;
    const html = await res.text();
    // Match all track audioPreview entries from the embed JSON
    const regex = /"uid":"([^"]+)".*?"audioPreview":\s*\{\s*"url":\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      previews.set(match[1], match[2]);
    }
    // Also try matching by track URI pattern (spotify:track:ID -> preview URL)
    const regex2 = /"uri":"spotify:track:([^"]+)"[^}]*?"audioPreview":\s*\{\s*"url":\s*"([^"]+)"/g;
    while ((match = regex2.exec(html)) !== null) {
      previews.set(match[1], match[2]);
    }
  } catch {
    // Fallback to individual scraping
  } finally {
    clearTimeout(timeout);
  }
  return previews;
}

async function scrapePreviewUrl(trackId: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`https://open.spotify.com/embed/track/${trackId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/"audioPreview":\s*\{\s*"url":\s*"([^"]+)"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fillPreviewUrls(tracks: Track[], playlistId: string, minNeeded: number = 15): Promise<Track[]> {
  const withPreview = tracks.filter((t) => t.previewUrl).length;
  if (withPreview >= minNeeded) return tracks;

  // Step 1: Try bulk scrape from playlist embed page (single request)
  const bulkPreviews = await scrapePlaylistPreviews(playlistId);
  if (bulkPreviews.size > 0) {
    for (const track of tracks) {
      if (!track.previewUrl) {
        const url = bulkPreviews.get(track.id);
        if (url) track.previewUrl = url;
      }
    }
  }

  let found = tracks.filter((t) => t.previewUrl).length;
  if (found >= minNeeded) return tracks;

  // Step 2: Fall back to individual scraping for remaining tracks
  const missing = tracks.filter((t) => !t.previewUrl);
  const BATCH = 20;
  for (let i = 0; i < missing.length; i += BATCH) {
    if (found >= minNeeded) break;
    const batch = missing.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((t) => scrapePreviewUrl(t.id))
    );
    results.forEach((r, idx) => {
      if (r.status === "fulfilled" && r.value) {
        batch[idx].previewUrl = r.value;
        found++;
      }
    });
  }

  return tracks;
}

export async function getPlaylistTracks(token: string, playlistId: string): Promise<Track[]> {
  // Only fetch first 100 tracks — enough for 10 trivia questions
  let data;
  try {
    // February 2026 renamed /tracks to /items
    data = await spotifyFetch(`/playlists/${playlistId}/items?limit=100`, token);
  } catch {
    data = await spotifyFetch(`/playlists/${playlistId}/tracks?limit=100`, token);
  }
  const tracks: Track[] = [];
  for (const entry of data.items ?? []) {
    // February 2026 renamed the playlist item field from "track" to "item"
    const track = entry.track ?? entry.item;
    if (track && track.id && track.type !== "episode") {
      tracks.push(formatTrack(track as SpotifyTrack));
    }
  }

  // Fill missing preview URLs (bulk playlist embed first, then individual fallback)
  return fillPreviewUrls(tracks, playlistId);
}

/** Extract a playlist ID from a raw ID, an open.spotify.com URL or a spotify:playlist: URI */
export function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  const match =
    trimmed.match(/playlist[/:]([A-Za-z0-9]{22})/) ?? trimmed.match(/^([A-Za-z0-9]{22})$/);
  return match?.[1] ?? null;
}

// Depth-first search for the first object that owns a "trackList" array
function findTrackListOwner(node: unknown, depth = 0): Record<string, unknown> | null {
  if (!node || typeof node !== "object" || depth > 10) return null;
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj.trackList)) return obj;
  for (const value of Object.values(obj)) {
    const found = findTrackListOwner(value, depth + 1);
    if (found) return found;
  }
  return null;
}

function pickEmbedImage(entity: Record<string, unknown>): string {
  const visual = entity.visualIdentity as { image?: { url: string; maxWidth?: number }[] } | undefined;
  const images = visual?.image ?? [];
  if (images.length > 0) {
    return [...images].sort((a, b) => (b.maxWidth ?? 0) - (a.maxWidth ?? 0))[0].url;
  }
  const cover = entity.coverArt as { sources?: { url: string }[] } | undefined;
  return cover?.sources?.[0]?.url ?? "";
}

export interface EmbedPlaylist {
  summary: PlaylistSummary;
  tracks: Track[];
}

/**
 * Unofficial: read a public playlist from the open.spotify.com embed page.
 * Needs no access token, so it is not subject to Development Mode user limits,
 * but it only works for public playlists, returns at most ~100 tracks and may
 * break whenever Spotify changes the embed page markup.
 */
export async function getPlaylistFromEmbed(playlistId: string): Promise<EmbedPlaylist> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let html: string;
  try {
    const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Embed page error: ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  const script = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!script) throw new Error("Embed page missing __NEXT_DATA__");

  const entity = findTrackListOwner(JSON.parse(script[1]));
  if (!entity) throw new Error("Embed page has no track list (private or empty playlist?)");

  const coverUrl = pickEmbedImage(entity);
  const tracks: Track[] = [];
  for (const raw of entity.trackList as Record<string, unknown>[]) {
    const uri = typeof raw.uri === "string" ? raw.uri : "";
    const id = uri.startsWith("spotify:track:") ? uri.slice("spotify:track:".length) : "";
    const name = (raw.title ?? raw.name) as string | undefined;
    if (!id || !name) continue;
    const preview = raw.audioPreview as { url?: string } | undefined;
    tracks.push({
      id,
      name,
      artist: typeof raw.subtitle === "string" ? raw.subtitle.replace(/ /g, " ") : "",
      albumArt: coverUrl,
      previewUrl: preview?.url ?? null,
      uri,
      spotifyUrl: `https://open.spotify.com/track/${id}`,
    });
  }

  return {
    summary: {
      id: playlistId,
      name: (entity.name ?? entity.title ?? "Playlist") as string,
      imageUrl: coverUrl,
      trackCount: tracks.length,
    },
    tracks,
  };
}

export async function addTracksToPlaylist(
  token: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const body = JSON.stringify({ uris: trackUris });
  try {
    await spotifyFetch(`/playlists/${playlistId}/items`, token, { method: "POST", body });
  } catch {
    await spotifyFetch(`/playlists/${playlistId}/tracks`, token, { method: "POST", body });
  }
}
