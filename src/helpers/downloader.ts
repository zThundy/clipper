import fs from 'fs';
import axios from 'axios';
import { appPath } from './utils';
import { retry } from './retry';

let dryRunning = false;

export function dryRuns(enabled = true) {
    dryRunning = enabled;
}

export class Downloader {
    private readonly url: string;
    private readonly path: string;

    private tries: number;
    private maxTries: number;

    constructor(url: string, path: string) {
        this.url = url;
        this.path = appPath(path);

        this.tries = 0;
        this.maxTries = 0;
    }

    async download(): Promise<boolean> {
        do {
            try {
                await this.startDownload();

                return true;
            } catch (e) {
                console.error(`[downloader.ts] [${this.tries}/${this.maxTries}] Error while starting download`);
                console.error(e);
            }
        } while (++this.tries < this.maxTries);

        return false;
    }

    private startDownload() {
        return new Promise(async (res, rej) => {
            const method = dryRunning ? 'HEAD' : 'GET';
            const { data } = await axios({
                url: this.url,
                method: method,
                responseType: 'stream'
            });

            // TODO: type this
            data.on('data', (chunk: any) => {
                // console.log(`[downloader.ts] Downloaded ${chunk.length} bytes`)
            });

            data.on('close', async () => {
                console.log(`[downloader.ts] Download ${this.url} finished on ${this.path}`);
                await retry(async () => fs.renameSync(`${this.path}.progress`, `${this.path}`), {
                    delay: 200,
                    factor: 2,
                    maxDelay: 1000,
                });
                res(this.path);
            });

            data.pipe(fs.createWriteStream(`${this.path}.progress`));
        });
    }
}
