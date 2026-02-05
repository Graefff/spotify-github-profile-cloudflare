export interface RenderData {
    height: number;
    num_bar: number;
    content_bar: string;
    css_bar: string | null;
    title_text: string;
    artist_name: string;
    song_name: string;
    img: string; // Base64 encoded image or URL (if externally hosted, but here we embed)
    cover_image: boolean;
    bar_color: string;
    background_color: string;
    mode: string;
    is_now_playing: boolean;
    progress_data: {
        progress_percentage: number;
        current_time: string;
        remaining_time: string;
    };
}

export function renderDefault(data: RenderData): string {
    return `
    <svg width="300" height="${data.height}" viewBox="0 0 300 ${data.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <foreignObject width="300" height="${data.height}">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>
            .container {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              background-color: #${data.background_color};
              border-radius: 12px;
              padding: 10px;
              box-sizing: border-box;
              color: ${data.mode === 'dark' ? '#fff' : '#000'};
              position: relative;
              overflow: hidden;
            }
            .title {
              font-size: 12px;
              opacity: 0.8;
              margin-bottom: 8px;
            }
            .content {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .cover {
              width: 80px;
              height: 80px;
              border-radius: 8px;
              overflow: hidden;
              flex-shrink: 0;
              background-color: #333;
            }
            .cover img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .info {
              flex: 1;
              min-width: 0;
            }
            .song {
              font-weight: 600;
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: 4px;
            }
            .artist {
              font-size: 12px;
              opacity: 0.8;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .bar-container {
              display: flex;
              align-items: flex-end;
              height: 12px;
              gap: 2px;
              margin-top: 8px;
            }
            .bar {
              flex: 1;
              background-color: #${data.bar_color};
              border-radius: 1px;
              animation: bounce 0s infinite alternate;
              height: 100%;
              opacity: 0.6;
            }
            .progress-bar {
                width: 100%;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                margin-top: 8px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background-color: #${data.bar_color};
            }
            @keyframes bounce {
              0% { height: 10%; }
              100% { height: 100%; }
            }
            ${data.css_bar || ''}
          </style>
  
          <div class="container">
            <div class="title">${data.title_text}</div>
            <div class="content">
              ${data.cover_image
            ? `<div class="cover"><img src="data:image/jpeg;base64,${data.img}" /></div>`
            : ''}
              <div class="info">
                <div class="song">${data.song_name}</div>
                <div class="artist">${data.artist_name}</div>
                ${data.is_now_playing && data.num_bar > 0
            ? `<div class="bar-container">${data.content_bar}</div>`
            : ''}
              </div>
            </div>
            ${data.progress_data.progress_percentage > 0 ? `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.progress_data.progress_percentage}%"></div>
            </div>
            <div style="font-size: 10px; margin-top: 2px; display: flex; justify-content: space-between; opacity: 0.7;">
                <span>${data.progress_data.current_time}</span>
                <span>${data.progress_data.remaining_time}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </foreignObject>
    </svg>
    `;
}
