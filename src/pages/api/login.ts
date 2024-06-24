import type { NextApiRequest, NextApiResponse } from 'next'
import { URL } from 'url'

import {
  log,
  error,
  verbose,
  warn
} from '@/helpers/logger';

type ResponseData = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  if (req.method === 'GET') {
    // calculate if it is http or https
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const clientId = <string>process.env.TWITCH_CLIENT_ID
    const redirectUri = `${protocol}://${req.headers.host}/api/callback`
    const responseType = 'code'
    const scope = 'user:read:email clips:edit'

    verbose(`Got new login request from ${ip} with client id ${clientId} and redirect uri ${redirectUri}`);

    const url = new URL('https://id.twitch.tv/oauth2/authorize')
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('redirect_uri', redirectUri)
    url.searchParams.append('response_type', responseType)
    url.searchParams.append('scope', scope)

    verbose(`Redirecting to ${url.toString()}`)

    res.redirect(url.toString())
  } else {
    warn(`(/api/login) Method not allowed for ${ip}`);
    res.status(405).json({ message: 'Method not allowed' })
  }
}