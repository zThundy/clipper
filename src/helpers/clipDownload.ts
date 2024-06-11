import { ensureDirectoryExists, existsSync, writeFile } from './filesystem';
import { getClipUrl } from './clipUrlFetcher';
import { Downloader } from './downloader';
import { ClipDataResponse } from './types';
import { appPath } from './utils';


export class ClipDownloader {
    private clipOrUrl: ClipDataResponse;

    constructor(clipOrUrl: ClipDataResponse) {
        this.clipOrUrl = clipOrUrl;
    }

    async download(): Promise<void> {
        const clip = this.clipOrUrl;
        const mp4Path = `clips/${clip.id}.mp4`;
        const metaPath = `clips/${clip.id}.json`;

        ensureDirectoryExists(appPath('clips'));

        if (existsSync(appPath(mp4Path))) {
            console.log(`[clipDownload.ts] Clip ${clip.title} found at ${appPath(mp4Path)}`);
            return;
        }

        const promises: Promise<any>[] = [];
        const url = await getClipUrl(clip);

        // TODO: writing individual meta file
        promises.push(writeFile(appPath(metaPath), JSON.stringify(clip)));

        if (url) {
            const downloader = new Downloader(url, mp4Path);

            console.log(`[clipDownload.ts] Downloading clip ${clip.title}`);
            promises.push(downloader.download());
        }

        await Promise.all(promises);
    }
}
