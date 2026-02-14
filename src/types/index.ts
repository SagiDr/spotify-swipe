export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  preview_url: string | null;
  uri: string;
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  previewUrl: string | null;
  uri: string;
  spotifyUrl: string;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SwipeDecision {
  trackId: string;
  liked: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
}
