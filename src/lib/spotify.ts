import { SpotifyTrack, Track, SpotifyUser, SpotifyPlaylist } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch(endpoint: string, token: string, options?: RequestInit) {
  const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
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
const ENGLISH_QUERIES = [
  "genre:pop year:2023-2026",
  "genre:rock year:2020-2026",
  "genre:hip-hop year:2023-2026",
  "genre:electronic year:2022-2026",
  "genre:jazz year:2018-2026",
  "genre:classical year:2015-2026",
  "genre:r&b year:2023-2026",
  "genre:country year:2022-2026",
  "genre:latin year:2023-2026",
  "genre:indie year:2022-2026",
  "genre:metal year:2020-2026",
  "genre:soul year:2020-2026",
  "genre:funk year:2020-2026",
  "genre:reggaeton year:2023-2026",
  "genre:alternative year:2022-2026",
];

const HEBREW_QUERIES = [
  "שירים ישראליים חדשים",
  "מוזיקה ישראלית",
  "פופ ישראלי",
  "רוק ישראלי",
  "ראפ ישראלי",
  "מזרחית חדשה",
  "שירי אהבה בעברית",
  "ישראלי חדש",
  "היפ הופ ישראלי",
  "אלקטרוניקה ישראלית",
  "שירים בעברית",
  "להיטים ישראליים",
  "מוזיקה מזרחית",
  "אינדי ישראלי",
  "שירים ישראליים 2024",
];

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
  const isHebrew = language === "hebrew";

  const allQueries = isHebrew ? HEBREW_QUERIES : ENGLISH_QUERIES;
  const queries = shuffle(allQueries);
  // Fetch more per query for Hebrew since we filter out non-Hebrew tracks
  const perQuery = isHebrew
    ? Math.min(Math.ceil(maxCount / queries.length) * 3, 20)
    : Math.ceil(maxCount / queries.length) + 2;

  for (const query of queries) {
    if (tracks.length >= maxCount) break;

    try {
      // Smaller offset for Hebrew (smaller catalog), wider for English
      const offset = Math.floor(Math.random() * (isHebrew ? 50 : 900));
      const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: String(Math.min(perQuery, 20)),
        offset: offset.toString(),
      });
      if (isHebrew) params.set("market", "IL");

      const data = await spotifyFetch(`/search?${params}`, token);

      if (data.tracks?.items) {
        for (const track of data.tracks.items as SpotifyTrack[]) {
          if (seenIds.has(track.id) || tracks.length >= maxCount) continue;

          // For Hebrew mode, only include tracks with Hebrew in the name or artist
          if (isHebrew) {
            const trackName = track.name;
            const artistNames = track.artists.map((a) => a.name).join(" ");
            if (!hasHebrew(trackName) && !hasHebrew(artistNames)) continue;
          }

          seenIds.add(track.id);
          tracks.push(formatTrack(track));
        }
      }
    } catch (e) {
      try {
        const fallbackOffset = Math.floor(Math.random() * 20);
        const params = new URLSearchParams({
          q: query,
          type: "track",
          limit: String(Math.min(perQuery, 20)),
          offset: fallbackOffset.toString(),
        });
        if (isHebrew) params.set("market", "IL");

        const data = await spotifyFetch(`/search?${params}`, token);

        if (data.tracks?.items) {
          for (const track of data.tracks.items as SpotifyTrack[]) {
            if (seenIds.has(track.id) || tracks.length >= maxCount) continue;

            if (isHebrew) {
              const trackName = track.name;
              const artistNames = track.artists.map((a) => a.name).join(" ");
              if (!hasHebrew(trackName) && !hasHebrew(artistNames)) continue;
            }

            seenIds.add(track.id);
            tracks.push(formatTrack(track));
          }
        }
      } catch (e2) {
        console.error(`Failed to search for "${query}":`, e2);
      }
    }
  }

  // Shuffle the final result so genres are mixed together
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
