import type { NextApiRequest, NextApiResponse } from 'next'

import { ClipDataResponse } from '@/helpers/types'
import { ClipDownloader } from '@/helpers/clipDownload'

import fs from 'fs'
import archiver from 'archiver'
import { appPath, sleep, parseCookies } from '@/helpers/utils'
import { ensureDirectoryExists } from '@/helpers/filesystem'

import {
  verbose,
  error,
  warn
} from "@/helpers/logger";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1gb',
    },
    responseLimit: '5gb',
  },
}

async function getUserTwitchData(access_token: string): Promise<any> {
  const headers = new Headers({
    'Authorization': `Bearer ${access_token}`,
    'Client-Id': process.env.TWITCH_CLIENT_ID || '',
  });

  const response = await fetch('https://api.twitch.tv/helix/users', { headers });
  if (!response.ok) {
    error(`(/api/callback) Failed to get user ID`)
    throw new Error('Failed to get user ID')
  };
  const { data } = await response.json();
  if (!data || data.length === 0) {
    error(`(/api/callback) No user data returned`)
    throw new Error('No user data returned');
  }
  return data[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { access_token } = parseCookies(req);
    const user = await getUserTwitchData(access_token);
    if (!user) {
      error(`(/api/download) No user data returned`)
      throw new Error('No user data returned');
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    if (req.method === 'POST') {
      const selectedClips: ClipDataResponse[] = req.body;
      const errors: string[] = [];

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader("Content-Encoding", "none");

      verbose(`Downloading clips for user ${user.display_name} (${user.id})`);
      res.write('data: {"status": "start", "type": "clips"}\n\n');

      const maxClips = parseInt(process.env.MAX_CLIPS_DOWNLOAD || '10');
      // if tthe number of clips is greater than process.env.MAX_CLIPS_DOWNLOAD, return an error
      if (selectedClips.length > maxClips) {
        res.write('data: {"status": "error", "message": "Too many clips selected, max: ' + maxClips + ' clips (or 2 pages)", "type": "message"}\n\n');
        res.end();
        return;
      }

      for (const clip of selectedClips) {
        try {
          const downloader = new ClipDownloader(clip);

          res.write(`data: {"id": "${clip.id}", "status": "downloading", "type": "clips"}\n\n`);
          await downloader.download();
          const resp = {
            id: clip.id,
            status: 'success',
            type: "clips"
          }
          res.write(`data: ${JSON.stringify(resp)}\n\n`);
        } catch (e: any) {
          error(`Failed to download clip ${clip.id}: ${e}`);
          const resp = {
            id: clip.id,
            status: 'error',
            error: e.message,
            type: "clips"
          }
          res.write(`data: ${JSON.stringify(resp)}\n\n`);
          errors.push(e.message);
          await sleep(500);
          continue;
        }
      }

      // if there are any errors, terminate the process
      if (errors.length > 0) {
        res.write('data: {"status": "errored", "type": "clips"}\n\n');
        res.end();
        return;
      }

      res.write('data: {"status": "done", "type": "clips"}\n\n');
      await sleep(5000);
      res.write('data: {"status": "start", "type": "compressing"}\n\n')

      ensureDirectoryExists(appPath('zips'));
      // compress all the clips in one single zip file
      const zipFileName = `${user.id}_clips.zip`;
      const zipFilePath = appPath(`zips/${zipFileName}`);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      // pipe archive data to the output file
      archive.pipe(output);

      // append all clips to the zip file
      for (const clip of selectedClips) {
        res.write(`data: {"id": "${clip.id}", "status": "compressing", "type": "compressing"}\n\n`)
        const clipPath = appPath(`clips/${clip.id}.mp4`);
        const clipMetaPath = appPath(`clips/${clip.id}.json`);
        archive.append(fs.createReadStream(clipPath), { name: `${clip.id}.mp4` });
        archive.append(fs.createReadStream(clipMetaPath), { name: `${clip.id}.json` });
        res.write(`data: {"id": "${clip.id}", "status": "success", "type": "compressing"}\n\n`);
        await sleep(300);
      }

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      archive.finalize();
      // listen for all archive data to be written
      output.on('close', () => {
        // send the zip file to the user as a download
        res.write('data: {"status": "done", "type": "final"}\n\n');
        res.end();
        verbose(`Archive wrote ${archive.pointer()} bytes`);

        // delete all clips
        for (const clip of selectedClips) {
          const clipPath = appPath(`clips/${clip.id}.mp4`);
          const clipMetaPath = appPath(`clips/${clip.id}.json`);

          fs.unlinkSync(clipPath);
          fs.unlinkSync(clipMetaPath);
        }
      });
    } else if (req.method === 'GET') {
      // get the zip inside zip folder
      const zipFileName = `${user.id}_clips.zip`;
      const zipFilePath = appPath(`zips/${zipFileName}`);

      // check if the zip file exists
      if (!fs.existsSync(zipFilePath)) {
        res.status(404).json({ message: 'Zip file not found' });
        return;
      }

      // Get the file extension
      const fileExtension = zipFileName.split(".").pop()?.toLowerCase();

      // Define a mapping of file extensions to content types
      const contentTypeMap: { [key: string]: string } = {
        svg: "image/svg+xml",
        ico: "image/x-icon",
        png: "image/png",
        jpg: "image/jpeg",
        pdf: "application/pdf",
        mp4: "video/mp4",
        zip: "application/zip",
      };

      // Determine the content type based on the file extension
      const contentType = fileExtension ? contentTypeMap[fileExtension] : "application/octet-stream";

      // send the zip file to the user as a download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
      res.setHeader('Content-Length', fs.statSync(zipFilePath).size.toString());
      // Stream the file
      const fileStream = fs.createReadStream(zipFilePath);
      fileStream.pipe(res);
      // delete the zip file after sending it
      fileStream.on('end', () => {
        fs.unlinkSync(zipFilePath);
      });
    } else {
      warn(`(/api/download) Method not allowed for ${ip}`);
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (e: any) {
    error(`Failed to download clips: ${e}`);
    // clear cookies and redirect to login
    res.status(500).json({ message: e.message });
  }
}