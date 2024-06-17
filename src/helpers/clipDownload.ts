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
        return new Promise((res, rej) => {
            const clip = this.clipOrUrl;
            const mp4Path = `clips/${clip.id}.mp4`;
            const metaPath = `clips/${clip.id}.json`;

            ensureDirectoryExists(appPath('clips'));

            if (existsSync(appPath(mp4Path))) {
                console.log(`[clipDownload.ts] Clip ${clip.title} found at ${appPath(mp4Path)}`);
                res();
                return;
            }

            getClipUrl(clip)
                .then(url => {
                    if (!url) {
                        console.error(`[clipDownload.ts] Clip ${clip.title} URL not found`);
                        rej('Clip URL not found');
                        return;
                    }

                    // TODO: writing individual meta file
                    writeFile(appPath(metaPath), JSON.stringify(clip))
                        .then(() => {
                            console.log(`[clipDownload.ts] Clip ${clip.title} meta file written`)
                            const downloader = new Downloader(url, mp4Path);
                            console.log(`[clipDownload.ts] Downloading clip ${clip.title}`);
                            downloader.download()
                                .then(() => {
                                    console.log(`[clipDownload.ts] Clip ${clip.title} downloaded`);
                                    res();
                                })
                                .catch(e => {
                                    console.error(`[clipDownload.ts] Error while downloading clip ${clip.title}`);
                                    console.error(e);
                                    rej(e);
                                });
                        })
                        .catch(e => {
                            console.error(`[clipDownload.ts] Error while writing meta file for clip ${clip.title}`);
                            console.error(e);
                            rej(e);
                        });
                })
                .catch(e => {
                    console.error(`[clipDownload.ts] Error while downloading clip ${clip.title}`);
                    console.error(e);
                    rej(e);
                });
        });
    }
}
