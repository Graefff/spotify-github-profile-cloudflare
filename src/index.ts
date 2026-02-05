import { Hono } from 'hono'
import { SpotifyClient, SCOPES } from './spotify'
import { Storage } from './storage'
import { makeSvg, loadImageB64 } from './utils'

export type Bindings = {
    SPOTIFY_TOKENS: KVNamespace
    SPOTIFY_CLIENT_ID: string
    SPOTIFY_SECRET_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
    const clientId = c.env.SPOTIFY_CLIENT_ID
    // Construct dynamic redirect URI based on request host
    const url = new URL(c.req.url)
    const redirectUri = `${url.origin}/callback`

    const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`
    return c.redirect(loginUrl)
})

app.get('/callback', async (c) => {
    const code = c.req.query('code')
    if (!code) return c.text('No code provided', 400)

    const url = new URL(c.req.url)
    const redirectUri = `${url.origin}/callback`

    const spotify = new SpotifyClient(c.env, redirectUri)
    const storage = new Storage(c.env)

    try {
        const tokens = await spotify.getTokens(code)
        const user = await spotify.getUser(tokens.access_token)

        await storage.saveToken(user.id, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || '', // Refresh token might not be returned if not needed? Actually auth code flow always returns it.
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
            updated_at: Math.floor(Date.now() / 1000)
        })

        return c.html(`
            <h1>Connected!</h1>
            <p>Your User ID is: <strong>${user.id}</strong></p>
            <p>Use this URL in your markdown:</p>
            <code>https://spotify-github-profile.your-worker.workers.dev/api/view?uid=${user.id}&cover_image=true&theme=default</code>
        `)
    } catch (e) {
        return c.text(`Error: ${e}`, 500)
    }
})

app.get('/api/view', async (c) => {
    const uid = c.req.query('uid')
    const coverImage = c.req.query('cover_image') === 'true'
    const theme = c.req.query('theme') || 'default'
    const barColor = c.req.query('bar_color') || '53b14f'
    const backgroundColor = c.req.query('background_color') || '121212'
    const mode = c.req.query('mode') || 'light'
    const showOffline = c.req.query('show_offline') === 'true'

    if (!uid) return c.text('UID required', 400)

    const storage = new Storage(c.env)
    const url = new URL(c.req.url)
    const redirectUri = `${url.origin}/callback` // Not used for refresh but needed for constructor
    const spotify = new SpotifyClient(c.env, redirectUri)

    let tokenData = await storage.getToken(uid)

    if (!tokenData) {
        return c.text('User not found. Please login again.', 404)
    }

    // Check expiration and refresh if needed
    if (Date.now() / 1000 > tokenData.expires_at) {
        try {
            console.log("Refreshing token...")
            const newTokens = await spotify.refreshAccessToken(tokenData.refresh_token)
            tokenData = {
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token || tokenData.refresh_token, // Spotify might not return a new refresh token
                expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
                updated_at: Math.floor(Date.now() / 1000)
            }
            // Only write to KV on refresh! (Free Tier optimization)
            await storage.saveToken(uid, tokenData)
        } catch (e) {
            return c.text('Failed to refresh token. Please login again.', 401)
        }
    }

    // Fetch Data
    let item = null
    let isNowPlaying = false
    let progressMs = null
    let durationMs = null

    try {
        const nowPlaying = await spotify.getNowPlaying(tokenData.access_token)
        if (nowPlaying && nowPlaying.item) {
            item = nowPlaying.item
            isNowPlaying = true
            progressMs = nowPlaying.progress_ms
            durationMs = item.duration_ms
        } else if (!showOffline) {
            const recentlyPlayed = await spotify.getRecentlyPlayed(tokenData.access_token)
            if (recentlyPlayed && recentlyPlayed.items && recentlyPlayed.items.length > 0) {
                item = recentlyPlayed.items[0].track
                isNowPlaying = false
                durationMs = item.duration_ms
            }
        }
    } catch (e) {
        console.error("Spotify API Error", e)
        // Fallback to offline
    }

    if (!item) {
        // Offline / No data
        const svg = await makeSvg(
            "Offline", "Currently not playing", "", false, false, theme, barColor, showOffline, backgroundColor, mode, null, null
        )
        return c.body(svg, 200, {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=60, s-maxage=60'
        })
    }

    // Load Image
    let imgB64 = ""
    if (coverImage && item.album && item.album.images && item.album.images.length > 0) {
        const imgUrl = item.album.images[1]?.url || item.album.images[0]?.url // 300px or full size
        if (imgUrl) {
            imgB64 = await loadImageB64(imgUrl) || ""
        }
    }

    const artistName = item.artists.map((a: any) => a.name).join(', ')
    const songName = item.name

    const svg = await makeSvg(
        artistName, songName, imgB64, isNowPlaying, coverImage, theme, barColor, showOffline, backgroundColor, mode, progressMs, durationMs
    )

    return c.body(svg, 200, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60' // Cache at edge for 60s
    })
})

export default app
