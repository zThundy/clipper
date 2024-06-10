import type { NextApiRequest, NextApiResponse } from 'next'

import { ClipDataResponse } from '../../helpers/types'
import { ClipDownloader } from '../../helpers/clipDownload'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const clips = req.body as ClipDataResponse[];

        for (const clip of clips) {
            // console.log(`Downloading clip ${clip.title}`);
            const downloader = new ClipDownloader(clip);

            downloader.on('progress', bytes => {
                console.log(`Downloaded ${bytes} bytes`);
            });

            await downloader.download();
        }

        res.status(200).json({ success: true });
    }
}