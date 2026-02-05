# Deploying to Cloudflare Workers

Follow this step-by-step guide to deploy your Spotify GitHub Profile worker.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your computer.
- A [Cloudflare Account](https://dash.cloudflare.com/sign-up).
- A [Spotify Developer Application](https://developer.spotify.com/dashboard) (Client ID and Secret).

## Step 1: Install Dependencies

Open your terminal in this directory (`worker/`) and run:

```bash
npm install
```

## Step 2: Login to Cloudflare

Authenticate `wrangler` (the Cloudflare CLI) with your account:

```bash
npx wrangler login
```
This will open your browser. Click "Allow" to authorize.

## Step 3: Create Database (KV Namespace)

We need a place to store user tokens. Cloudflare KV is perfect for this. Run:

```bash
npx wrangler kv:namespace create SPOTIFY_TOKENS
```

**Copy the output!** It will look something like this:

```toml
[[kv_namespaces]]
binding = "SPOTIFY_TOKENS"
id = "809b1234567890abcdef1234567890ab"
```

## Step 4: Configure Wrangler

Open the file `wrangler.toml` in your editor. Find the `[[kv_namespaces]]` section and paste the `id` you copied in Step 3.

It should look like this:

```toml
[[kv_namespaces]]
binding = "SPOTIFY_TOKENS"
id = "809b1234567890abcdef1234567890ab" # <--- Paste your ID here
preview_id = "..." # Optional, can be same as above or a separate dev namespace
```

## Step 5: Set Spotify Secrets

For security, we don't save API keys in the code. We upload them to Cloudflare's encrypted storage.

Run these commands (replace the values with your actual keys from Spotify Dashboard):

```bash
npx wrangler secret put SPOTIFY_CLIENT_ID
# (Paste your Client ID when prompted and hit Enter)

npx wrangler secret put SPOTIFY_SECRET_ID
# (Paste your Client Secret when prompted and hit Enter)
```

## Option 2: Deploy via Cloudflare Dashboard (Git Integration)

If you prefer determining deployments via GitHub pushes instead of the CLI, follow these steps.

### 1. Prepare your Repository
1.  Create the KV Namespace in the [Cloudflare Dashboard](https://dash.cloudflare.com) > **Storage & Databases** > **KV**.
2.  Copy the **ID** of the new namespace.
3.  Update the `worker/wrangler.toml` file in your code with this ID (just like in Step 4 above).
4.  Commit and Push your code to your GitHub repository.

### 2. Connect GitHub
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Go to **Workers & Pages** > **Create Application**.
3.  Click the **Connect to Git** button (or "Create Worker" > "Deploy from Git").
4.  Select your repository (`spotify-github-profile`).

### 3. Configure the Build
1.  **Project Name**: `spotify-github-profile` (or whatever you prefer).
2.  **Production Branch**: `main` (or `master`).
3.  **Build Settings**: Leave as default (Cloudflare detects `wrangler.toml`).

### 4. Set Secrets (Environment Variables)
Before clicking "Save and Deploy" (or immediately after failure):
1.  Look for the **Environment Variables** settings (sometimes you have to create the worker first, then go to **Settings** > **Variables**).
2.  Add your secrets here:
    -   `SPOTIFY_CLIENT_ID`: Your Client ID
    -   `SPOTIFY_SECRET_ID`: Your Secret
    -   **Encrypt** them if given the option.

### 5. Finalize
-   Click **Save and Deploy**.
-   Cloudflare will clone your repo, install dependencies, and deploy the worker.

---

## Step 7: Final Configuration

1.  Copy your worker's URL (e.g., `https://spotify-github-profile.username.workers.dev`).
2.  Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
3.  Edit your App Settings.
4.  Add a **Redirect URI**: `https://YOUR_WORKER_URL/callback`
5.  Save.

## Step 8: Connect & Use

1.  Visit your Worker URL in the browser.
2.  Log in with Spotify.
3.  You will see a "Connected!" message with your unique URL.
4.  Copy that URL into your GitHub Profile README.

```markdown
![Spotify Status](https://YOUR_WORKER_URL/api/view?uid=YOUR_UID&cover_image=true&theme=default)
```
