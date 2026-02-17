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
    previewUrl: track.preview_url,
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
          if (track.popularity < MIN_POPULARITY) continue;

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
  return spotifyFetch(`/users/${userId}/playlists`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });
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
        trackCount: item.tracks?.total ?? 0,
      });
    }
    url = data.next ? data.next.replace("https://api.spotify.com/v1", "") : "";
  }

  return playlists;
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

async function fillPreviewUrls(tracks: Track[], minNeeded: number = 15): Promise<Track[]> {
  const withPreview = tracks.filter((t) => t.previewUrl).length;
  if (withPreview >= minNeeded) return tracks;

  const missing = tracks.filter((t) => !t.previewUrl);
  let found = withPreview;

  // Scrape in parallel batches of 20, stop early once we have enough
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
  // Step 1: Fetch full track details from the playlist
  const tracks: Track[] = [];
  let url = `/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const data = await spotifyFetch(url, token);
    for (const item of data.items ?? []) {
      if (item.track && item.track.id) {
        tracks.push(formatTrack(item.track as SpotifyTrack));
      }
    }
    url = data.next ? data.next.replace("https://api.spotify.com/v1", "") : "";
  }

  // Step 2: For tracks missing preview URLs, scrape from Spotify embed pages
  return fillPreviewUrls(tracks);
}

export async function addTracksToPlaylist(
  token: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  await spotifyFetch(`/playlists/${playlistId}/tracks`, token, {
    method: "POST",
    body: JSON.stringify({ uris: trackUris }),
  });
}
