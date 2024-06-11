import type { NextApiRequest, NextApiResponse } from 'next'
import { URL } from 'url'

type ResponseData = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    const clientId = <string>process.env.TWITCH_CLIENT_ID
    const redirectUri = `http://${req.headers.host}/api/callback`
    const responseType = 'code'
    const scope = 'user:read:email clips:edit'

    const url = new URL('https://id.twitch.tv/oauth2/authorize')
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('redirect_uri', redirectUri)
    url.searchParams.append('response_type', responseType)
    url.searchParams.append('scope', scope)

    res.redirect(url.toString())
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}