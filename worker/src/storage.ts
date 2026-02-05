import { Bindings } from './index'

export interface StoredToken {
    access_token: string
    refresh_token: string
    expires_at: number // Unix timestamp in seconds
    updated_at: number
}

export class Storage {
    private kv: KVNamespace

    constructor(env: Bindings) {
        this.kv = env.SPOTIFY_TOKENS
    }

    async getToken(uid: string): Promise<StoredToken | null> {
        return this.kv.get<StoredToken>(`user:${uid}`, 'json')
    }

    async saveToken(uid: string, token: StoredToken): Promise<void> {
        // Optimization: Only write if necessary (caller handles logic)
        // But here we just write.
        await this.kv.put(`user:${uid}`, JSON.stringify(token))
    }

    async deleteToken(uid: string): Promise<void> {
        await this.kv.delete(`user:${uid}`)
    }
}
