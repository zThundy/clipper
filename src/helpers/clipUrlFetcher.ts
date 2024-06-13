import { ClipDataResponse, YoutubeDlClipDump } from './types';
import { youtubedl } from './youtube-dl/youtubedl';

export async function getClipUrl(clip: ClipDataResponse): Promise<string | null> {
    return new Promise(async (res, rej) => {
        try {
            console.log(`[clipUrlFetcher.ts] Fetching clip URL for: ${clip.title}`);
    
            // Use YoutubeDL to fetch manifest URL
            const ytdl = await youtubedl();
            const meta = await ytdl?.getVideoInfo(clip.url) as YoutubeDlClipDump;
            console.log(`[clipUrlFetcher.ts] ${meta.title}.mp4 file URL: ${meta.url}`);
            res(meta.url);
        } catch(e: any) {
            console.error(`[clipUrlFetcher.ts] Error while fetching clip URL for: ${clip.title}`);
            console.error(e);
            rej(e);
        }
    });
}
