import { ClipDataResponse, YoutubeDlClipDump } from './types';
import { youtubedl } from './youtube-dl/youtubedl';

export async function getClipUrl(clip: ClipDataResponse): Promise<string | null> {
    console.log(`Fetching clip URL for: ${clip.title}`);

    // Use YoutubeDL to fetch manifest URL
    try {
        const ytdl = await youtubedl();
        const meta = await ytdl?.getVideoInfo(clip.url) as YoutubeDlClipDump;
        console.log(`youtube-dl: ${meta.title} .mp4 file URL: ${meta.url}`);
        return meta.url;
    } catch (e) {
        console.error(`youtube-dl: Failed to retrieve the clip URL for ${clip.title}: ${e}`);
        return null;
    }
}
