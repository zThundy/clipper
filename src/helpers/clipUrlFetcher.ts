import { ClipDataResponse, YoutubeDlClipDump } from './types';
import { youtubedl } from './youtube-dl/youtubedl';

export async function getClipUrl(clip: ClipDataResponse): Promise<string | null> {
    console.log(`[clipUrlFetcher.ts] Fetching clip URL for: ${clip.title}`);

    // Use YoutubeDL to fetch manifest URL
    try {
        const ytdl = await youtubedl();
        const meta = await ytdl?.getVideoInfo(clip.url) as YoutubeDlClipDump;
        console.log(`[clipUrlFetcher.ts] ${meta.title}.mp4 file URL: ${meta.url}`);
        return meta.url;
    } catch (e) {
        console.error(`[clipUrlFetcher.ts] Failed to retrieve the clip URL for ${clip.title}: ${e}`);
        return null;
    }
}
