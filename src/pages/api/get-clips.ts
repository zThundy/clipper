import type { NextApiRequest, NextApiResponse } from 'next'
// import { redirect } from 'next/navigation';
import * as fns from 'date-fns';

import {
    ensureDirectoryExists,
    readFile,
    exists,
    writeFile
} from "../../helpers/filesystem";

import {
    create as cacheCreate,
    get as cacheGet,
    add as cacheAdd,
    write as cacheWrite
} from "../../helpers/cache";

import {
    appPath,
} from "../../helpers/utils";

import {
    ClipDataResponse,
    ClipData,
    Period,
    ClipRequest,
    AuthData,
    Dict
} from '../../helpers/types'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ClipData>
) {
    if (req.method === 'GET') {
        // get the page number from the url query
        const { access_token, refresh_token, user_data } = parseCookies(req);
        // get date from the url query
        let { left, right, cursor, currentPage } = req.query;
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

        if (isNaN(Number(currentPage))) {
            return res.status(400).json({
                type: "error",
                redirect: true,
                redirectPath: "/",
                message: "Invalid page number"
            } as any);
        }

        // get created_at from user_data
        const { created_at, id } = JSON.parse(decodeURIComponent(user_data)) as Dict<string>;

        // create base period
        let period: Period = { left: new Date(), right: new Date() };
        if (left) period.left = new Date(left as string)
        else period.left = new Date(created_at);
        if (right) period.right = new Date(right as string);
        if (!cursor) cursor = "";

        try {
            const data = await getAllClips({ access_token, refresh_token, user_id: id }, period, cursor as string, Number(currentPage));
            res.status(200).json(data as any);
        } catch (error: any) {
            console.error('Failed to get clips', error);
            if (error.message === 'Access token expired') {
                // The access token is expired, use the refresh token to get a new one
                const newAccessToken = await refreshAccessToken(refresh_token);

                // Save the new access token in a cookie
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toUTCString() // 1 hour from now
                res.setHeader('Set-Cookie', `access_token=${newAccessToken}; Path=/; HttpOnly; Expires=${expiryDate}`);

                console.log('Access token refreshed')
                // Retry the request to get the clips
                const data = await getAllClips({ access_token, refresh_token, user_id: id }, period, cursor as string, Number(currentPage));
                res.status(200).json(data as any);
            } else {
                // clear the cookies
                res.setHeader('Set-Cookie', `access_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                res.setHeader('Set-Cookie', `refresh_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                res.setHeader('Set-Cookie', `user_data=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);

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

async function getAllClips(auth: AuthData, period: Period, cursor: string | undefined | null, currentPage: number): Promise<[ClipDataResponse[], Boolean | String]> {
    const clipsFromBatch: ClipDataResponse[] = [];
    let thereIsMore: String | Boolean = false;
    let retries: number = 0;
    cacheCreate(auth.user_id);
    let cache = cacheGet(auth.user_id);

    if (typeof cursor === 'string' && cursor.length === 0) cursor = undefined;
    ensureDirectoryExists(appPath('cache'));

    try {
        do {
            if (retries > 5) {
                console.error('Too many retries, stopping the pagination');
                thereIsMore = false;
                cursor = null;
                break;
            }
            
            if (cache.find(auth.user_id, currentPage.toString())) {
                console.log(`Page ${currentPage} already exists in cache, skipping...`);
                cursor = cacheGet(auth.user_id).find((c) => c.page === currentPage.toString())?.cursor;
                if (clipsFromBatch.length >= Number(process.env.MAX_CLIP_TOTAL || 100)) {
                    console.error(`Reached ${process.env.MAX_CLIP_TOTAL || 100} clips, stopping the pagination`);
                    thereIsMore = <string>cursor;
                    cursor = null;
                    break;
                }
                continue;
            }

            // This somehow fixes type-hinting in PhpStorm
            const responsePromise = paginate(auth, period, cursor);
            const response = await responsePromise;

            if (response === false) {
                console.error('Error while paginating, waiting a few seconds before continuing...');
                await sleep(10000);
                retries++;
                continue;
            }

            if (!iterable(response.data)) {
                console.error('API returned 200 but data is not iterable, waiting before trying again...');
                await sleep(10000);
                retries++;
                continue;
            }

            // save cursor for the next request
            cursor = response?.pagination?.cursor;
            if (clipsFromBatch.length >= Number(process.env.MAX_CLIP_TOTAL || 100)) {
                console.error(`Reached ${process.env.MAX_CLIP_TOTAL || 100} clips, stopping the pagination`);
                thereIsMore = cursor;
                cursor = null;
                break;
            }

            for (const clip of response.data) {
                clipsFromBatch.push(clip);
            }

            retries = 0;
            cacheAdd(auth.user_id, currentPage.toString(), cursor);
        } while (cursor);
        
        cacheWrite(auth.user_id);
        return [clipsFromBatch, thereIsMore];
    } catch (e) {
        if (clipsFromBatch.length) {
            return [clipsFromBatch, thereIsMore];
        } else {
            throw e;
        }
    }
}

async function paginate(auth: AuthData, period: Period, cursor: string | undefined | null): Promise<ClipData | false> {
    try {
        const { left, right } = period;

        return await clips(auth, {
            broadcaster_id: auth.user_id,
            first: process.env.MAX_CLIP_PER_FETCH as string,
            after: cursor,
            started_at: fns.formatRFC3339(left),
            ended_at: fns.formatRFC3339(right)
        });
    } catch (e: any) {
        console.error('Error while paginating the API', e);
        // throw e;
        if (e.message === 'Access token expired') {
            throw e;
        }
        return false;
    }
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

    console.log("Parameters: ", parameters.toString());
    const url = `${process.env.BASE_URL as string}?${parameters.toString()}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Access token expired');
        throw new Error(`Failed to fetch clips: ${response.status} ${response.statusText}`);
    }

    const data = await response.json()
    return data;
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