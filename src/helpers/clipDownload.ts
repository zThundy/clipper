import { EventEmitter } from 'events';
import { ensureDirectoryExists, existsSync, writeFile } from './filesystem';
import { TransferSpeedCalculator } from './transfer-speed-calculator';
import { getClipUrl } from './clipUrlFetcher';
import { Downloader } from './downloader';
import { ClipDataResponse } from './types';
import { appPath } from './utils';


export class ClipDownloader extends EventEmitter {
    private clipOrUrl: ClipDataResponse;

    public readonly speed: TransferSpeedCalculator;

    constructor(clipOrUrl: ClipDataResponse) {
        super();
        this.clipOrUrl = clipOrUrl;

        this.speed = new TransferSpeedCalculator;
    }

    async download(): Promise<void> {
        const clip = this.clipOrUrl;
        const mp4Path = `clips/${clip.id}.mp4`;
        const metaPath = `clips/${clip.id}.json`;

        ensureDirectoryExists(appPath('clips'));

        if (existsSync(appPath(mp4Path))) {
            console.log(`Clip ${clip.title} found at ${appPath(mp4Path)}`);
            return;
        }

        const promises: Promise<any>[] = [];
        const url = await getClipUrl(clip);

        // TODO: writing individual meta file
        promises.push(writeFile(appPath(metaPath), JSON.stringify(clip)));

        if (url) {
            const downloader = new Downloader(url, mp4Path);

            downloader.on('progress', bytes => {
                this.speed.data(bytes);
            });

            console.log(`[clipDownload] Downloading clip ${clip.title}`);
            promises.push(downloader.download());
        }

        await Promise.all(promises);
    }
}
