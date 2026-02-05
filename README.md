# spotify-github-profile

Create Spotify now playing card on your github profile

Running on Vercel serverless function, store data in Firebase (store only access_token, refresh_token, token_expired_timestamp)

## Annoucements

**2024-06-21**

Vercel change the package the free tier is not enough for our usage. I moved service to self-host at Digital Ocean.

Please replace your old endpoint `https://spotify-github-profile.vercel.app` to `https://spotify-github-profile.kittinanx.com`

## Table of Contents  
[Connect And Grant Permission](#connect-and-grant-permission)  
[Example](#example)  
[Running for development locally](#running-for-development-locally)  
[Setting up Vercel](#setting-up-vercel)  
[Setting up Firebase](#setting-up-firebase)  
[Setting up Spotify dev](#setting-up-spotify-dev)  
[Running locally](#running-locally)  
[How to Contribute](#how-to-contribute)  
[Known Bugs](#known-bugs)  
[Features in Progress](#features-in-progress)  
[Credit](#credit)  

## Connect And Grant Permission

- Click `Connect with Spotify` button below to grant permission

[<img src="/img/btn-spotify.png">](https://spotify-github-profile.kittinanx.com/api/login)

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

## Running Locally
```bash
npm run dev
```
(Requires creating a local `.dev.vars` file or passing secrets if not logged in).

## How to Contribute

- Develop locally and submit a pull request!
- Submit newly encountered bugs to the [Issues](https://github.com/kittinan/spotify-github-profile/issues) page
- Submit feature suggestions to the [Issues](https://github.com/kittinan/spotify-github-profile/issues) page, with the label [Feature Suggestion]

## Known Bugs

[404/500 Error when playing local files](https://github.com/kittinan/spotify-github-profile/issues/19)

## Other Platforms
- [Apple Music GitHub Profile](https://github.com/rayriffy/apple-music-github-profile)

## Credit

Inspired by https://github.com/natemoo-re
