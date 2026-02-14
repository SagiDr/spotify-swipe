# Spotify Swipe

A Tinder-style web app that lets you swipe through songs to discover your music taste, then generates a personalized Spotify playlist based on your likes.

**Live demo:** [spotifyswipe.vercel.app](https://spotifyswipe.vercel.app)

## How It Works

1. **Log in** with your Spotify account
2. **Choose** your language (English/Hebrew) and number of songs (10-35)
3. **Swipe right** to like, **swipe left** to skip (or use the buttons)
4. **Get a playlist** — a personalized Spotify playlist is created in your account based on the songs you liked

## Features

- Swipe gestures with smooth animations
- In-app song previews (Spotify embed player)
- English and Hebrew song modes
- Light and dark theme
- Adjustable song count (10-35)
- Playlist auto-created in your Spotify account
- Only popular, diverse songs — 1 per artist, 1 per album

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Spotify Web API**

## Getting Started

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) app with Client ID and Client Secret

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/SagiDr/spotify-swipe.git
   cd spotify-swipe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   NEXTAUTH_SECRET=any_random_string
   NEXTAUTH_URL=http://127.0.0.1:3000
   ```

4. Add `http://127.0.0.1:3000/api/auth/callback` as a redirect URI in your Spotify Developer Dashboard.

5. Run the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)
