import type { NextApiRequest, NextApiResponse } from 'next'
// import { redirect } from 'next/navigation';
import * as fns from 'date-fns';

import {
    ClipDataResponse,
    ClipData,
    Period,
    ClipRequest,
    AuthData,
    Dict,
} from '../../helpers/types'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ClipData>
) {
    if (req.method === 'GET') {
        // get the page number from the url query
        const { access_token, refresh_token, user_data } = parseCookies(req)
        if (!access_token || !refresh_token || !user_data) {
            console.error('Access token, refresh token or user data not found in cookies');
            res.status(401).json({
                type: "error",
                redirect: true,
                redirectPath: "/api/login",
                message: "Access token, refresh token or user data not found in cookies"
            } as any);
            return;
        }

        // get created_at from user_data
        const { created_at, id } = JSON.parse(decodeURIComponent(user_data)) as Dict<string>;

        try {
            const data = await getAllClips({ access_token, refresh_token, user_id: id }, { left: new Date(created_at), right: new Date() });
            res.status(200).json(data as any);
        } catch (error: any) {
            if (error.message === 'Access token expired') {
                // The access token is expired, use the refresh token to get a new one
                const newAccessToken = await refreshAccessToken(refresh_token);

                // Save the new access token in a cookie
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toUTCString() // 1 hour from now
                res.setHeader('Set-Cookie', `access_token=${newAccessToken}; Path=/; HttpOnly; Expires=${expiryDate}`);

                // Retry the request to get the clips
                const data = await getAllClips({ access_token, refresh_token, user_id: id }, { left: new Date(), right: new Date() });
                res.status(200).json(data as any);
            } else {
                // console.error('Failed to get clips', error);
                res.status(500).json({
                    type: "error",
                    redirect: true,
                    redirectPath: "/",
                    message: "Something bad happened"
                } as any);
            }
        }
    } else {
        res.status(405).json({
            type: "error",
            redirect: true,
            redirectPath: "/",
            message: "Method Not Allowed"
        } as any);
    }
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

function sleep(delay: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

// https://stackoverflow.com/questions/18884249/checking-whether-something-is-iterable
function iterable(obj: any): boolean {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.iterator] === 'function';
}

async function clips(auth: AuthData, req: ClipRequest): Promise<ClipData> {
    const headers = new Headers({
        'Authorization': `Bearer ${auth.access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID || '',
    });

    const parameters = new URLSearchParams();

    for (const [key, value] of Object.entries(req)) {
        if (value) parameters.append(key, value as string);
    }

    const url = `${process.env.BASE_URL as string}?${parameters.toString()}`;
    // console.log("URL: ", url);

    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Access token expired');
        }

        throw new Error(`Failed to fetch clips: ${response.status} ${response.statusText}`);
    }

    const data = await response.json()
    return data;
}

async function paginate(auth: AuthData, period: Period, cursor: ClipData["pagination"]["cursor"]): Promise<ClipData | false> {
    try {
        const { left, right } = period;

        return await clips(auth, {
            broadcaster_id: auth.user_id,
            first: process.env.MAX_CLIPS_NUMBER as string,
            after: cursor,
            started_at: fns.formatRFC3339(left),
            ended_at: fns.formatRFC3339(right)
        });
    } catch (e) {
        console.error('Error while paginating the API', e);
        return false;
    }
}

async function getAllClips(auth: AuthData, period: Period): Promise<ClipDataResponse[]> {
    const clipsFromBatch: ClipDataResponse[] = [];
    let cursor: ClipData["pagination"]["cursor"] = "";

    try {
        do {
            // This somehow fixes type-hinting in PhpStorm
            const responsePromise = paginate(auth, period, cursor);
            const response = await responsePromise;

            if (response === false) {
                console.error('Error while paginating, waiting a few seconds before continuing...');
                await sleep(10000);
                continue;
            }

            if (!iterable(response.data)) {
                console.error('API returned 200 but data is not iterable, waiting before trying again...');
                await sleep(10000);
                continue;
            }

            for (const clip of response.data) {
                clipsFromBatch.push(clip);
            }

            cursor = response?.pagination?.cursor;

            // dev
            // break;
        } while (cursor);

        return clipsFromBatch;
    } catch (e) {
        if (clipsFromBatch.length) {
            return clipsFromBatch;
        } else {
            throw e;
        }
    }
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