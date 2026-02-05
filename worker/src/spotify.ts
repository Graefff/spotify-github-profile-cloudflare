import { Bindings } from './index'

export interface SpotifyTokenResponse {
    access_token: string
    token_type: string
    scope: string
    expires_in: number
    refresh_token?: string
}

export interface SpotifyUser {
    id: string
    display_name: string
    images: { url: string }[]
}

export const SCOPES = 'user-read-currently-playing user-read-recently-played'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_USER_URL = 'https://api.spotify.com/v1/me'
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode'
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=10'

export class SpotifyClient {
    private clientId: string
    private clientSecret: string
    private redirectUri: string

    constructor(env: Bindings, redirectUri: string) {
        this.clientId = env.SPOTIFY_CLIENT_ID
        this.clientSecret = env.SPOTIFY_SECRET_ID
        this.redirectUri = redirectUri
    }

    private getBasicAuth(): string {
        return btoa(`${this.clientId}:${this.clientSecret}`)
    }

    async getTokens(code: string): Promise<SpotifyTokenResponse> {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
        })

        const res = await fetch(SPOTIFY_TOKEN_URL, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${this.getBasicAuth()}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        })

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to get tokens: ${res.status} ${text}`)
        }

        return res.json()
    }

    async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        })

        const res = await fetch(SPOTIFY_TOKEN_URL, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${this.getBasicAuth()}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        })

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to refresh token: ${res.status} ${text}`)
        }

        return res.json()
    }

    async getUser(accessToken: string): Promise<SpotifyUser> {
        const res = await fetch(SPOTIFY_USER_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) {
            throw new Error(`Failed to get user: ${res.status}`)
        }

        return res.json()
    }

    async getNowPlaying(accessToken: string): Promise<any> {
        const res = await fetch(SPOTIFY_NOW_PLAYING_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (res.status === 204) return null; // Nothing playing

        if (!res.ok) {
            throw new Error(`Failed to get now playing: ${res.status}`)
        }

        return res.json()
    }

    async getRecentlyPlayed(accessToken: string): Promise<any> {
        const res = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (res.status === 204) return null;

        if (!res.ok) {
            throw new Error(`Failed to get recently played: ${res.status}`)
        }

        return res.json()
    }
}
