import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  access_token?: string
  refresh_token?: string
  message?: string
}

import {
  exists,
  deleteFile,
} from '@/helpers/filesystem';

import {
  verbose,
  error,
  warn
} from "@/helpers/logger";
import { appPath } from '@/helpers/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  if (req.method === 'GET') {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const code = req.query.code as string

    if (!code) {
      warn(`(/api/callback) Authorization code is required for ${ip}`);
      res.status(308).redirect('/');
      return
    }

    try {
      const requestBody = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID || '',
        client_secret: process.env.TWITCH_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${protocol}://${req.headers.host}/api/callback`
      });

      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString()
      })

      if (!response.ok) {
        error(`(/api/callback) Failed to exchange authorization code for access token for ${ip}`);
        throw new Error('Failed to exchange authorization code for access token')
      }

      const { access_token, refresh_token, expires_in } = await response.json()
      const data = await getUserTwitchData(access_token)

      // TODO: Save the access token and refresh token to your database

      // set access token and refresh token in cookies
      const expiryDate = new Date(Date.now() + expires_in * 1000).toUTCString();
      res.setHeader('Set-Cookie', [
        `access_token=${access_token}; Path=/; HttpOnly; Expires=${expiryDate}; Secure`,
        `refresh_token=${refresh_token}; Path=/; HttpOnly; Expires=${expiryDate}; Secure`,
        `user_data=${encodeURIComponent(JSON.stringify(data))}; Path=/; HttpOnly; Expires=${new Date('9999-12-31T23:59:59Z').toUTCString()}`
      ])

      verbose(`(/api/callback) Successfully exchanged authorization code for access token for ${data.display_name} (${data.id}) from ${ip}`);

      const cachePath = appPath(`cache/${data.id}.json`);
      // delete cached data for the user that logged in (if any)
      if (await exists(appPath(cachePath))) {
        verbose(`(/api/callback) Deleting cache for ${data.display_name} (${data.id}) from ${ip}`);
        await deleteFile(appPath(cachePath));
      }

      const clipsCachePath = appPath(`cache/${data.id}_clips.json`);
      if (await exists(appPath(clipsCachePath))) {
        verbose(`(/api/callback) Deleting clips cache for ${data.display_name} (${data.id}) from ${ip}`);
        await deleteFile(appPath(clipsCachePath));
      }

      // redirect to the dashboard
      res.redirect('/dashboard');
    } catch (error: any) {
      console.log('error', error)
      res.status(500).json({ message: error.message })
    }
  } else {
    warn(`(/api/callback) Method not allowed for ${ip}`);
    res.status(405).json({ message: 'Method not allowed' })
  }
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