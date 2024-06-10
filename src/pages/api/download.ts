import type { NextApiRequest, NextApiResponse } from 'next'

import { ClipDataResponse } from '../../helpers/types'
import { ClipDownloader } from '../../helpers/clipDownload'

import fs from 'fs'
import { appPath } from '../../helpers/utils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const selectedClips: ClipDataResponse[] = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader("Content-Encoding", "none");

        res.write('data: {"status": "downloading", "type": "initial"}\n\n');

        for (const clip of selectedClips) {
            try {
                const downloader = new ClipDownloader(clip);

                res.write(`data: {"id": "${clip.id}", "status": "downloading", "type": "progress"}\n\n`);
                await downloader.download();
                const resp = {
                    id: clip.id,
                    status: 'success',
                    type: "final"
                }
                res.write(`data: ${JSON.stringify(resp)}\n\n`);
            } catch (e: any) {
                const resp = {
                    id: clip.id,
                    status: 'failed',
                    error: e.message,
                    type: "final"
                }
                res.write(`data: ${JSON.stringify(resp)}\n\n`);
            }
        }

        // DEV: delete all the downloaded clips
        selectedClips.forEach(clip => {
            const mp4Path = `clips/${clip.id}.mp4`;
            const metaPath = `clips/${clip.id}.json`;
            fs.unlinkSync(appPath(mp4Path));
            fs.unlinkSync(appPath(metaPath));
        })

        res.write('data: {"status": "done", "type": "final"}\n\n');
        res.end();
    }
}