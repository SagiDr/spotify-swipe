# Spotify Swipe

> Discover music you love — one swipe at a time.

Spotify Swipe is a web application that reimagines music discovery through an intuitive swipe-based interface. Users are presented with a curated selection of songs and swipe to indicate their preferences. Based on those choices, the app generates a personalized Spotify playlist tailored to their taste.

**Live:** [spotifyswipe.vercel.app](https://spotifyswipe.vercel.app)

---

## Overview

1. Authenticate with your Spotify account
2. Configure your session — select language and number of songs
3. Swipe through songs — right to like, left to skip
4. Receive a custom playlist — automatically saved to your Spotify library

## Key Features

- **Swipe-based discovery** — fluid drag gestures with animated card transitions
- **In-app previews** — listen to tracks directly within the app via Spotify's embedded player
- **Multi-language support** — English and Hebrew song catalogs
- **Theme options** — light and dark mode
- **Curated selection** — songs are filtered by popularity with a maximum of one track per artist and per album to ensure variety
- **Playlist generation** — recommendations are built from your liked songs and saved directly to your Spotify account

## Built With

| Technology | Purpose |
|---|---|
| **Next.js 14** | Full-stack React framework (App Router) |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Gesture handling and animations |
| **Spotify Web API** | Authentication, search, and playlist creation |
