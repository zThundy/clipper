import type { NextApiRequest, NextApiResponse } from 'next'

import { ClipDataResponse } from '../../helpers/types'
import { ClipDownloader } from '../../helpers/clipDownload'

import fs from 'fs'
import { appPath } from '../../helpers/utils'

async function getUserTwitchData(access_token: string): Promise<any> {
  const headers = new Headers({
    'Authorization': `Bearer ${access_token}`,
    'Client-Id': process.env.TWITCH_CLIENT_ID || '',
  });

  const response = await fetch('https://api.twitch.tv/helix/users', { headers });
  if (!response.ok) throw new Error('Failed to get user ID');
  const { data } = await response.json();
  if (!data || data.length === 0) throw new Error('No user data returned');
  return data[0];
}

function parseCookies(req: NextApiRequest) {
  const rawCookies = req.headers.cookie?.split('; ') || []
  const parsedCookies: { [key: string]: string } = {}
  rawCookies.forEach(rawCookie => {
    const [key, value] = rawCookie.split('=')
    parsedCookies[key] = value
  })
  return parsedCookies
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { access_token } = parseCookies(req);
      const user = await getUserTwitchData(access_token);
      if (!user) throw new Error('No user data returned');
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
      // selectedClips.forEach(clip => {
      //   const mp4Path = `clips/${clip.id}.mp4`;
      //   const metaPath = `clips/${clip.id}.json`;
      //   fs.unlinkSync(appPath(mp4Path));
      //   fs.unlinkSync(appPath(metaPath));
      // })

      res.write('data: {"status": "done", "type": "final"}\n\n');
      res.end();
    } catch (e: any) {
      console.error('Failed to download clips', e);
      // clear cookies and redirect to login
      res.status(500).json({ message: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}