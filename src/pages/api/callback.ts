import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  access_token?: string
  refresh_token?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    console.log('req.headers.host', req.headers.host)
    console.log('req.query.code', req.query.code)

    const code = req.query.code as string

    if (!code) {
      res.status(400).json({ message: 'Authorization code is required' })
      return
    }

    try {
      const requestBody = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID || '',
        client_secret: process.env.TWITCH_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `http://${req.headers.host}/api/callback`
      });

      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString()
      })

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code for access token')
      }

      const { access_token, refresh_token, expires_in } = await response.json()
      const user_id = await getUserId(access_token)

      // TODO: Save the access token and refresh token to your database

      // set access token and refresh token in cookies
      const expiryDate = new Date(Date.now() + expires_in * 1000).toUTCString();
      res.setHeader('Set-Cookie', [
        `access_token=${access_token}; Path=/; HttpOnly; Expires=${expiryDate}; Secure`,
        `refresh_token=${refresh_token}; Path=/; HttpOnly; Expires=${expiryDate}; Secure`,
        `user_id=${user_id}; Path=/; HttpOnly; Expires=${new Date('9999-12-31T23:59:59Z').toUTCString()}`,
      ])

      // redirect to the dashboard
      res.redirect('/dashboard')
    } catch (error: any) {
      console.log('error', error)
      res.status(500).json({ message: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

async function getUserId(access_token: string): Promise<string> {
  const headers = new Headers({
    'Authorization': `Bearer ${access_token}`,
    'Client-Id': process.env.TWITCH_CLIENT_ID || '',
  });

  const response = await fetch('https://api.twitch.tv/helix/users', {
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get user ID')
  }

  const { data } = await response.json()

  if (!data || data.length === 0) {
    throw new Error('No user data returned')
  }

  return data[0].id
}