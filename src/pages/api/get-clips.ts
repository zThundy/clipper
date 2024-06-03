import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingMessage } from 'http'

type ClipData = {
    // Define the type of your clip data here
    data: {
        id: string,
        url: string,
        embed_url: string,
        broadcaster_id: string,
        broadcaster_name: string,
        creator_id: string,
        creator_name: string,
        video_id: string,
        game_id: string,
        language: string,
        title: string,
        view_count: number,
        created_at: string,
        thumbnail_url: string
    }[]
    pagination: {
        cursor: string
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ClipData>
) {
    if (req.method === 'GET') {
        // get the page number from the url query
        // const page = req.query.page as string || '1'
        const cursor = req.query.cursor as string || ''
        const { access_token, refresh_token, user_id } = parseCookies(req)

        if (!access_token || !refresh_token) {
            res.status(401).json({ message: 'Unauthorized' } as any)
            return
        }

        try {
            const data = await getClips(access_token, user_id, cursor);
            res.status(200).json(data)
        } catch (error: any) {
            if (error.message === 'Access token expired') {
                // The access token is expired, use the refresh token to get a new one
                const newAccessToken = await refreshAccessToken(refresh_token)

                // Save the new access token in a cookie
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toUTCString() // 1 hour from now
                res.setHeader('Set-Cookie', `access_token=${newAccessToken}; Path=/; HttpOnly; Expires=${expiryDate}`)

                // Retry the request to get the clips
                const data = await getClips(newAccessToken, user_id, cursor);
                res.status(200).json(data)
            } else {
                res.status(500).json({ message: error.message } as any)
            }
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' } as any)
    }
}

function parseCookies(req: IncomingMessage) {
    const rawCookies = req.headers.cookie?.split('; ') || []
    const parsedCookies: { [key: string]: string } = {}
    rawCookies.forEach(rawCookie => {
        const [key, value] = rawCookie.split('=')
        parsedCookies[key] = value
    })
    return parsedCookies
}

async function getClips(access_token: string, user_id: string, cursor: ClipData["pagination"]["cursor"]): Promise<ClipData> {
    const headers = new Headers({
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID || '',
    });

    const baseUrl = `https://api.twitch.tv/helix/clips?broadcaster_id=${user_id}&first=21`
    const url = cursor !== "null" ? `${baseUrl}&after=${cursor}` : baseUrl
    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Access token expired');
        }

        throw new Error('Failed to get clips');
    }

    const data = await response.json()
    // console.log("currentCursor", data.pagination.cursor, "passedCursor", cursor);
    return data
}

async function refreshAccessToken(refresh_token: string): Promise<string> {
    const body = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID || '',
        client_secret: process.env.TWITCH_CLIENT_SECRET || '',
        refresh_token,
        grant_type: 'refresh_token',
    }).toString();

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })

    if (!response.ok) {
        throw new Error('Failed to refresh access token')
    }

    const { access_token } = await response.json()
    return access_token
}