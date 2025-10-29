# Spotify Integration Setup

Waxly now integrates with Spotify to find matching albums for your Discogs collection!

## Getting Spotify API Credentials

1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if needed)
3. Click **"Create app"**
4. Fill in the app details:
   - **App name**: Waxly (or any name you prefer)
   - **App description**: Personal vinyl collection manager
   - **Redirect URI**: `http://localhost:3000` (not used but required)
   - Check the Terms of Service box
5. Click **"Save"**
6. On your app's dashboard, click **"Settings"**
7. You'll see your **Client ID** and **Client Secret** (click "View client secret")

## Configure Waxly

1. Open the `.env` file in the Waxly project root
2. Replace the placeholder values:
   ```
   REACT_APP_SPOTIFY_CLIENT_ID=your_actual_client_id_here
   REACT_APP_SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   ```
3. Save the file
4. Restart the Waxly application

## How It Works

When you click on an album in your collection to view details:
1. Waxly fetches the full album information from Discogs
2. It automatically searches Spotify for a matching album using the artist name and album title
3. If a match is found, you'll see a **"🎵 Spotify Match Found"** section with:
   - Album artwork from Spotify
   - Release date and track count
   - Links to open the album in Spotify
   - A button to play the album directly

## Privacy & Security

- Your Spotify credentials are stored locally in the `.env` file
- The `.env` file is excluded from git (never committed)
- Waxly uses the Spotify Client Credentials flow (no user login required)
- No personal Spotify data is accessed or stored

## Troubleshooting

**No Spotify matches found?**
- The search uses artist name, album title, and year
- Some albums may not be available on Spotify
- Variations in artist/album names between Discogs and Spotify can affect matching

**"Failed to fetch release details" error?**
- Check that your Spotify credentials are correct in `.env`
- Ensure you've restarted the app after adding credentials
- Check your internet connection
