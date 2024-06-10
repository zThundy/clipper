import os from 'os';
import fs from 'fs';
import { Downloader } from '../downloader';
import { binPath, sleep } from '../utils';
import { ensureDirectoryExists, exists } from '../filesystem';

// youtube-dl download path (filename is 'youtube-dl' when OS is Linux, and 'youtube-dl.exe' when OS is windows')
export const YOUTUBEDL_URL = 'https://github.com/ytdl-org/youtube-dl/releases/latest/download/{filename}';

export class YoutubedlDownloader {
    async download(permission: fs.Mode = 0o755): Promise<void> {
        const output = this.path();
        const url = this.url();

        console.log(`Downloading youtube-dl from ${url} to ${output}`); // eslint-disable-line no-console
        ensureDirectoryExists(binPath());
        if (await exists(output)) {
            console.log(`youtube-dl: ${output} already exists`);
            return;
        }

        console.log("Downloader class initialized")
        const downloader = new Downloader(url, output);

        console.log(`youtubedl: Download latest version ${url} to ${output}`);
        await downloader.download();

        console.log(`youtube-dl: Downloaded to ${output}`); // eslint-disable-line no-console

        // TODO: move this to downloader
        fs.chmodSync(output, permission);
        // Delay return to avoid EBUSY errors
        await sleep(1000);
    }

    url(): string {
        return YOUTUBEDL_URL.replace('{filename}', this.filename());
    }

    path(): string {
        return binPath(this.filename());
    }

    filename(): string {
        if (os.platform() === 'win32') {
            return 'youtube-dl.exe';
        } else {
            return 'youtube-dl';
        }
    }
}
