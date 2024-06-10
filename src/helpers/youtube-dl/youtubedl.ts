// @ts-ignore
import Wrap from './youtube-dl-wrap';
import { YoutubedlDownloader } from './youtubedl-downloader';

import { appPath } from '../utils';
import { existsSync } from '../filesystem';

export async function youtubedl() {
    const ytdl = new YoutubedlDownloader;
    const ytdlPath = ytdl.path();
    console.log(`[youtubedl.ts] Checking for youtube-dl at ${ytdlPath}`)

    if (existsSync(appPath(ytdlPath))) {
        const wrap = new Wrap(ytdlPath);
        return wrap;
    } else {
        try {
            await ytdl.download();
            return new Wrap(ytdlPath);
        } catch (e) {
            console.error(`[youtubedl.ts] Failed to download youtubedl: ${e}`);
            return null;
        }
    }
}