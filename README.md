# spotify-github-profile

Create Spotify now playing card on your github profile

Running on Cloudflare Workers, storing data in Cloudflare KV (access_token, refresh_token).


> **Warning**: Currently, Spotify has paused access to their API for new applications, making it impossible to create new deployments temporarily. As of February 2026, the API is still unavailable.

## Example

- Default theme

![spotify-github-profile](/img/default.svg)

- Compact theme

![spotify-github-profile](/img/compact.svg)

- Natemoo-re theme

![spotify-github-profile](/img/natemoo-re.svg)

- Novatorem theme

![spotify-github-profile](/img/novatorem.svg)

- Karaoke theme

![spotify-github-profile](/img/karaoke.svg)

- Spotify Embed theme (NEW!)

![spotify-github-profile](/img/spotify-embed.svg)

## Deployment to Cloudflare Workers

The project has been migrated to Cloudflare Workers for better performance and zero-cost hosting.

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Cloudflare Account](https://dash.cloudflare.com/).
- [Spotify Developer Application](https://developer.spotify.com/dashboard).

### Step 1: Install Dependencies
Open your terminal in the project root and run:
```bash
npm install
```

### Step 2: Login to Cloudflare
```bash
npx wrangler login
```

### Step 3: Create Database (KV Namespace)
```bash
npx wrangler kv:namespace create SPOTIFY_TOKENS
```
Copy the `id` from the output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SPOTIFY_TOKENS"
id = "PASTE_YOUR_ID_HERE" 
```

### Step 4: Set Secrets
Add your Spotify Client ID and Secret to Cloudflare's encrypted storage (or via Dashboard > Settings > Environment Variables):
```bash
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_SECRET_ID
```

### Option 1: Deploy via CLI
```bash
npm run deploy
```

### Option 2: Deploy via Cloudflare Dashboard (Git Integration)
1.  **Push** your code to GitHub.
2.  **Connect** in Cloudflare Dashboard > Workers & Pages > Create > Connect to Git.
3.  **Configure**:
    -   **Build Settings**: Default.
4.  **Important**: You must manually add `SPOTIFY_CLIENT_ID` and `SPOTIFY_SECRET_ID` in the Dashboard under **Settings > Variables**.

### Final Configuration
1.  Get your Worker URL (e.g., `https://spotify-github-profile.username.workers.dev`).
2.  Go to [Spotify Dashboard](https://developer.spotify.com/dashboard) > App Settings.
3.  Add Redirect URI: `https://YOUR_WORKER_URL/callback`.

## Credit

Inspired by https://github.com/natemoo-re
