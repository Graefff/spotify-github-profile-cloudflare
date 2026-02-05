import { renderDefault } from './templates/default'

export async function loadImageB64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            cf: {
                cacheTtl: 86400,
                cacheEverything: true
            }
        })
        if (!response.ok) return null
        const buffer = await response.arrayBuffer()
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    } catch (e) {
        console.error(`Error loading image ${url}:`, e)
        return null
    }
}

export function generateCssBar(numBar: number): string {
    let cssBar = ""
    let left = 1
    for (let i = 1; i <= numBar; i++) {
        const anim = Math.floor(Math.random() * (500 - 350 + 1) + 350)
        cssBar += `.bar:nth-child(${i}) { left: ${left}px; animation-duration: ${anim}ms; }`
        left += 4
    }
    return cssBar
}

export function formatTimeMs(milliseconds: number | null): string {
    if (milliseconds === null || milliseconds < 0) return "0:00"
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function calculateProgress(progressMs: number | null, durationMs: number | null) {
    if (!progressMs || !durationMs || durationMs <= 0) {
        return {
            progress_percentage: 0,
            current_time: "0:00",
            remaining_time: "0:00"
        }
    }

    const progress = Math.min(progressMs, durationMs)
    const percentage = (progress / durationMs) * 100
    const remaining = durationMs - progress

    return {
        progress_percentage: percentage,
        current_time: formatTimeMs(progress),
        remaining_time: `-${formatTimeMs(remaining)}`
    }
}

// Sparse sampling for color extraction (lighter CPU usage)
export async function extractColor(imgBase64: string): Promise<string> {
    // Placeholder: Real image processing in workers is tough without heavy libs.
    // returning default green for now to satisfy 10ms CPU limit.
    // Implementing a true JS parser for JPEG in <10ms is risky.
    return "53b14f"
}


export async function makeSvg(
    artist: string,
    song: string,
    img: string,
    isNowPlaying: boolean,
    coverImage: boolean,
    theme: string,
    barColor: string,
    showOffline: boolean,
    backgroundColor: string,
    mode: string,
    progressMs: number | null,
    durationMs: number | null
): Promise<string> {

    // Default values
    let height = 145
    let numBar = 75

    if (coverImage) height = 445

    if (isNowPlaying) {
        const cssBar = generateCssBar(numBar)
        const contentBar = Array(numBar).fill('<div class="bar"></div>').join('')

        return renderDefault({
            height, numBar, content_bar: contentBar, css_bar: cssBar,
            title_text: "Now playing",
            artist_name: artist,
            song_name: song,
            img,
            cover_image: coverImage,
            bar_color: barColor,
            background_color: backgroundColor,
            mode,
            is_now_playing: true,
            progress_data: calculateProgress(progressMs, durationMs)
        })
    } else {
        return renderDefault({
            height, numBar, content_bar: "", css_bar: null,
            title_text: "Recently played",
            artist_name: artist,
            song_name: song,
            img,
            cover_image: coverImage,
            bar_color: barColor,
            background_color: backgroundColor,
            mode,
            is_now_playing: false,
            progress_data: calculateProgress(0, durationMs)
        })
    }
}
