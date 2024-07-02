import type { NextApiRequest, NextApiResponse } from 'next'
// import { redirect } from 'next/navigation';
import * as fns from 'date-fns';

import {
    ensureDirectoryExists,
} from "@/helpers/filesystem";

import {
    // create as cacheCreate,
    get as cacheGet,
    add as cacheAdd,
    // save as cacheWrite,
    saveAll as cacheWriteAll,
    find as cacheFind,
    // dump as cacheDump
} from "@/helpers/cache";

import {
    verbose,
    error,
    warn,
    log
} from "@/helpers/logger";

import {
    appPath,
    parseCookies
} from "@/helpers/utils";

import {
    ClipDataResponse,
    ClipData,
    Period,
    ClipRequest,
    AuthData,
    Dict,
    Filters
} from '@/helpers/types'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ClipData>
) {
    const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    if (req.method === 'GET') {
        // get the page number from the url query
        const { access_token, refresh_token, user_data } = parseCookies(req);
        // get date from the url query
        let { filters: f, currentPage } = req.query;
        if (!access_token || !refresh_token || !user_data) {
            error(`Access token, refresh token or user data not found in cookies from ${ip}`);
            res.status(401).json({
                type: "error",
                redirect: true,
                redirectPath: "/api/login",
                message: "Access token, refresh token or user data not found in cookies"
            } as any);
            return;
        }

        if (isNaN(Number(currentPage))) {
            error(`Invalid page number from ${ip}`);
            return res.status(400).json({
                type: "error",
                redirect: true,
                redirectPath: "/",
                message: "Invalid page number"
            } as any);
        }

        // get created_at from user_data
        const { created_at, id } = JSON.parse(decodeURIComponent(user_data)) as Dict<string>;

        let filters: Filters | null | undefined = null;
        let left, right;
        if (f) {
            filters = JSON.parse(decodeURIComponent(f as string)) as Filters;
            verbose(`Filters: ${JSON.stringify(filters)}`)
            left = filters?.startDate;
            right = filters?.endDate;
            verbose(`Left: ${left}, Right: ${right}`)
        }


        // create base period
        let period: Period = { left: new Date(), right: new Date() };
        if (left) period.left = new Date(left as string)
        else period.left = new Date(created_at);
        if (right) period.right = new Date(right as string);

        try {
            verbose(`Getting clips for ${id}, ip: ${ip}...`)
            const data = await getAllClips({ access_token, refresh_token, user_id: id }, period, Number(currentPage));
            verbose(`Got ${data.length} clips for ${id}, ip: ${ip}...`)
            const sorted = sortClips(data, filters);
            verbose(`Sending ${sorted.length} clips for ${id}, ip: ${ip}...`)
            res.status(200).json(sorted as any);
        } catch (e: any) {
            error(`Failed to get clips for ${id}, ip: ${ip} error: ${e}`);
            if (e.message === 'Access token expired') {
                // The access token is expired, use the refresh token to get a new one
                const newAccessToken = await refreshAccessToken(refresh_token);

                // Save the new access token in a cookie
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toUTCString() // 1 hour from now
                res.setHeader('Set-Cookie', `access_token=${newAccessToken}; Path=/; HttpOnly; Expires=${expiryDate}`);

                verbose(`Access token refresh for ${id} successful, retrying the request...`);
                // Retry the request to get the clips
                const data = await getAllClips({ access_token, refresh_token, user_id: id }, period, Number(currentPage));
                verbose(`Got ${data.length} clips for ${id}, ip: ${ip}...`)
                const sorted = sortClips(data, filters);
                verbose(`Sending ${sorted.length} clips for ${id}, ip: ${ip}...`)
                res.status(200).json(sorted as any);
            } else {
                // clear the cookies
                res.setHeader('Set-Cookie', `access_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                res.setHeader('Set-Cookie', `refresh_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                res.setHeader('Set-Cookie', `user_data=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);

                error(`Failed to get clips for ${id}, ip: ${ip} error: ${e}`);
                res.status(500).json({
                    type: "error",
                    redirect: true,
                    redirectPath: "/",
                    message: "Something bad happened"
                } as any);
            }
        }
    } else {
        warn(`(/api/get-clips) Method not allowed for ${ip}`);
        res.status(405).json({
            type: "error",
            redirect: true,
            redirectPath: "/",
            message: "Method Not Allowed"
        } as any);
    }
}

function sortClips(data: ClipDataResponse[], filters: Filters | null): ClipDataResponse[] {
    if (!filters) return data;
    const { author, startDate, endDate, title, sortBy } = filters;

    // log(`Filtering clips by author: ${author}, startDate: ${startDate}, endDate: ${endDate}, title: ${title}`)
    // log(data)

    if (author && author.length > 0) {
        verbose(`Filtering clips by author: ${author}`);
        data = data.filter(clip => clip.creator_name === author);
        verbose(`Filtered clips by author: ${author}, ${data.length} clips left`);
    }

    if (startDate) {
        verbose(`Filtering clips by startDate: ${startDate}`);
        data = data.filter(clip => new Date(clip.created_at) >= new Date(startDate));
        verbose(`Filtered clips by startDate: ${startDate}, ${data.length} clips left`);
    }

    if (endDate) {
        verbose(`Filtering clips by endDate: ${endDate}`);
        data = data.filter(clip => new Date(clip.created_at) <= new Date(endDate));
        verbose(`Filtered clips by endDate: ${endDate}, ${data.length} clips left`);
    }

    if (title && title.length > 0) {
        verbose(`Filtering clips by title: ${title}`);
        data = data.filter(clip => clip.title.toLocaleLowerCase().includes(title.toLocaleLowerCase()));
        verbose(`Filtered clips by title: ${title}, ${data.length} clips left`);
    }

    switch (sortBy) {
        case "duration":
            verbose(`Sorting clips by duration`);
            data = data.sort((a, b) => a.duration - b.duration);
            verbose(`Sorted clips by duration`);
            break;
        case "views":
            verbose(`Sorting clips by views`);
            data = data.sort((a, b) => a.view_count - b.view_count);
            verbose(`Sorted clips by views`);
            break;
        case "title":
            verbose(`Sorting clips by title`);
            data = data.sort((a, b) => a.title.localeCompare(b.title));
            verbose(`Sorted clips by title`);
            break;
        case "date":
            verbose(`Sorting clips by date`);
            data = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            verbose(`Sorted clips by date`);
            break;
        default:
            verbose(`No sorting applied`);
            break;
    }

    // log(`Filtered clips:`)
    // log(data)

    return data;
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

async function getAllClips(auth: AuthData, period: Period, currentPage: number): Promise<ClipDataResponse[]> {
    const clipsFromBatch: ClipDataResponse[] = [];
    let retries: number = 0;
    cacheGet(auth.user_id, appPath('cache'));
    cacheGet(`clips_${auth.user_id}`, appPath('cache'));
    let cursor: string | null = null;
    let fetchedClips: number = 0;

    ensureDirectoryExists(appPath('cache'));

    try {
        do {
            if (retries > 5) {
                error('Too many retries, stopping the pagination');
                break;
            }

            const cacheCursor = cacheFind(auth.user_id, currentPage.toString());
            if (cacheCursor?.data === "end" || cursor === "end") {
                warn(`Cache cursor is "${cacheCursor?.data}", skipping pagination (?) Maybe end of the list (?)`);
                break;
            }

            if (cacheCursor?.data) {
                verbose(`Cache found for ${auth.user_id} page ${currentPage} cursor ${cursor}; Not fetching new data`);
                currentPage++;
                cursor = cacheCursor?.data;
                continue;
            }

            const responsePromise = paginate(auth, period, cacheCursor?.data || cursor);
            const response = await responsePromise;

            if (response === false) {
                error('Error while paginating, waiting a few seconds before continuing...');
                await sleep(10000);
                retries++;
                continue;
            }

            if (!iterable(response.data)) {
                error('API returned 200 but data is not iterable, waiting before trying again...');
                await sleep(10000);
                retries++;
                continue;
            }

            fetchedClips += response.data.length;

            // save cursor for the next request
            cursor = response?.pagination?.cursor;
            if (fetchedClips >= Number(process.env.MAX_CLIP_TOTAL || 100)) {
                verbose(`Reached ${process.env.MAX_CLIP_TOTAL || 100} clips, stopping the pagination`);
                cursor = null;
                break;
            }

            if (cursor === undefined || cursor === null) {
                cursor = "end";
                response.pagination.cursor = "end";
            }

            verbose(`Adding cache for ${auth.user_id} page ${currentPage} cursor ${cursor}`);
            cacheAdd(auth.user_id, currentPage.toString(), cursor);
            cacheAdd(`clips_${auth.user_id}`, cursor, JSON.stringify(response));

            currentPage++;
            retries = 0;
        } while (cursor);

        let _cursor = ""
        let _currentPage = 1
        do {
            const cacheCursor = cacheFind(auth.user_id, _currentPage.toString());
            _cursor = cacheCursor?.data as string || "end";
            const cacheClips = cacheFind(`clips_${auth.user_id}`, _cursor);
            if (cacheClips) {
                verbose(`Adding clips from cache for ${auth.user_id} page ${_currentPage} cursor ${_cursor}`);
                const resp = JSON.parse(cacheClips.data);
                clipsFromBatch.push(...resp.data);
                _cursor = resp?.pagination?.cursor;
            }

            _currentPage++;
        } while (_cursor !== "end" && _cursor !== null && _cursor !== undefined);

        cacheWriteAll();
        // cacheDump(auth.user_id);
        return clipsFromBatch;
    } catch (e) {
        if (clipsFromBatch.length) {
            return clipsFromBatch;
        } else {
            throw e;
        }
    }
}

async function paginate(auth: AuthData, period: Period, cursor: string | undefined | null): Promise<ClipData | false> {
    try {
        const { left, right } = period;
        verbose(`Paginating for ${auth.user_id} cursor: ${cursor} left: ${left} right: ${right}`);

        return await clips(auth, {
            broadcaster_id: auth.user_id,
            first: process.env.MAX_CLIP_PER_FETCH as string,
            after: cursor,
            started_at: fns.formatRFC3339(left),
            ended_at: fns.formatRFC3339(right)
        });
    } catch (e: any) {
        error(`Failed to paginate for ${auth.user_id}: ${e}`);
        // throw e;
        if (e.message === 'Access token expired') {
            throw e;
        }
        return false;
    }
}

async function clips(auth: AuthData, req: ClipRequest): Promise<ClipData> {
    verbose(`Fetching clips for ${auth.user_id}, request: ${JSON.stringify(req)}`)

    const headers = new Headers({
        'Authorization': `Bearer ${auth.access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID || '',
    });

    const parameters = new URLSearchParams();
    for (const [key, value] of Object.entries(req)) {
        if (value) parameters.append(key, value as string);
    }

    verbose(`Parameters for clips api request ${parameters.toString()}`);
    const url = `${process.env.BASE_URL as string}/clips?${parameters.toString()}`;
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