<div align="center">

# Spotify Swipe

**Discover music you love — one swipe at a time.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Spotify](https://img.shields.io/badge/Spotify_API-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://spotifyswipe.vercel.app)

[Live Demo](https://spotifyswipe.vercel.app)

</div>

---

Spotify Swipe is a web app that combines music discovery with fun. Swipe through songs to build personalized playlists, or test how well you know your own music library with a trivia game.

## How It Works

### Swipe Mode

Discover new music through an intuitive swipe interface.

> 1. Connect your Spotify account
> 2. Choose your language (English / Hebrew) and number of songs
> 3. Swipe **right** to like, **left** to skip
> 4. Get a custom playlist saved directly to your Spotify library

Songs are curated from a wide range of genres and artists, filtered by popularity with a max of one track per artist and per album to keep things fresh.

### Trivia Mode

Think you know your playlists? Put it to the test.

> 1. Pick any playlist from your Spotify library
> 2. Listen to short audio clips from tracks in that playlist
> 3. Guess the song from four multiple-choice options
> 4. See your final score and challenge yourself again

Every round is different — the game pulls tracks directly from your own playlists, so it's always personal.

---

## Features

| Feature | Description |
|---|---|
| **Swipe Discovery** | Fluid drag gestures with animated card transitions |
| **Music Trivia** | Guess-the-song game with audio clips from your playlists |
| **In-App Previews** | Listen to tracks without leaving the app |
| **Multi-Language** | English and Hebrew song catalogs |
| **Light & Dark Mode** | Switch themes to match your preference |
| **Playlist Generation** | Recommendations built from your likes, saved to Spotify |
| **Score Tracking** | See how well you know your music after each round |

---

## Known Limitation

> **Spotify apps in Development Mode only allow pre-approved users.**
>
> Since February 2026 Spotify limits a Development Mode app to **5 allowlisted users** (managed in the [Developer Dashboard](https://developer.spotify.com/dashboard) under **Settings > User Management**), and the app owner must have Premium. Accounts outside the allowlist get **0 playlists and 0 songs** on login.
>
> **This app offers two ways around that:**
>
> 1. **Log in with your own Spotify app** (home page link). Any user creates a free Spotify developer app, adds this site's redirect URI, and pastes its **Client ID**. The app then logs them in through *their* app using Authorization Code + PKCE (no client secret), so our allowlist doesn't apply. This works for both Swipe and Trivia. The user's app owner needs Premium.
>
> 2. **Public-playlist Trivia with no login.** Paste a link to any public playlist; the app reads it from Spotify's public embed page (`open.spotify.com/embed/playlist/...`) instead of the Web API. Unofficial and undocumented: at most ~100 tracks, and it may break if Spotify changes the embed page.
>
> The code also tolerates the February 2026 Web API changes (`/playlists/{id}/tracks` -> `/items`, `POST /me/playlists`, renamed item fields, removed `popularity`), falling back to the old shapes for apps not yet migrated.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | Full-stack React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Gesture handling and animations |
| [Spotify Web API](https://developer.spotify.com/documentation/web-api) | Authentication, search, and playlist management |

---

<div align="center">

</div>
