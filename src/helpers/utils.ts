import path from 'path';
import * as fns from 'date-fns';
import { differenceInMinutes, format } from 'date-fns';
import { Period } from './types';
import { NextApiRequest } from 'next';

const SPLIT_FACTOR = 2;
const CLIP_ID_REGEX = /\.tv\/(.+?)(?:\?|$)/;
const VIDEO_ID_REGEX = /\.tv\/videos\/(\d+)/;

export function twitchVideoUrlToId(url: string): string {
    const match = url.match(VIDEO_ID_REGEX);

    if (!match) {
        throw new Error(`Could extract Twitch Video ID from URL: ${url}`);
    }

    return match[1];
}

export function twitchClipUrlToId(url: string): string {
    const match = url.match(CLIP_ID_REGEX);

    if (!match) {
        throw new Error(`Could extract Twitch Clip ID from URL: ${url}`);
    }

    return match[1];
}

export function splitPeriod(period: Period): Period[] {
    // left/right is reversed so we get a positive number
    const diffInMinutes = differenceInMinutes(period.right, period.left);
    const ceil = Math.ceil(diffInMinutes / SPLIT_FACTOR);

    if (diffInMinutes === ceil) {
        throw Error('Reached 1 minute periods, something is probably wrong.');
    }

    console.log(`Splitting period of ${diffInMinutes}min in ${ceil}min increments`);
    return generateBatchesFrom(period.left, period.right, ceil);
}

export function generateBatches(periodDurationHours = 24 * 30): Period[] {
    // The day Twitch Clips were announced
    const left = new Date(2016, 4, 26);
    const right = fns.endOfToday();

    return generateBatchesFrom(left, right, periodDurationHours * 60);
}

export function generateBatchesFrom(left: Date, right: Date, minutesIncrements: number): Period[] {
    const batches: Period[] = [];

    while (fns.compareAsc(right, left) >= 0) {
        const next = fns.addMinutes(left, minutesIncrements);
        batches.push({ left: left, right: next });
        left = next;
    }

    return batches;
}

export function apiDelay(remaining: number, total: number, resetTime: number): number {
    // How fast the delay grows
    const degree = 3;
    // Delay starts when remaining requests is below 10% the total rate-limit
    const startsAt = total * 0.1;

    if (startsAt < remaining) {
        return 0;
    }

    const factor = 1 - Math.pow(remaining / startsAt, degree);

    return resetTime * factor;
}

export function binPath(p = ''): string {
    return path.resolve(process.env.BIN_PATH ?? appPath('bin'), p);
}

export function appPath(p = ''): string {
    const basePath = process.env.BASEPATH ?? process.cwd();

    return path.resolve(basePath, p);
}

export function videosPath(p = ''): string {
    return path.resolve(appPath('videos'), p);
}

export function quotes(s: string): string {
    return ['"', s, '"'].join('');
}

export function pathableDate(date: Date): string {
    return format(date, 'yyyy-LL-dd_hh-mm-ss');
}

export function nowSeconds(): number {
    return Math.round(Date.now() / 1000);
}

export function sleep(delay: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

export function E(number: number): number {
    return 10 ** number;
}

export function round(number: number, precision: number): number {
    return Math.round(number * E(precision)) / E(precision);
}

export function bpsToHuman(bps: number): string {
    let index = 0;
    const suffixes = ['bps', 'kbps', 'mbps', 'gbps', 'tbps'];
    while (bps <= 1024 && suffixes[index + 1]) {
        bps /= 1024;
        index++;
    }

    return [round(bps, 2), suffixes[index]].join('');
}

export function convert(amount: number) {
    return {
        byte: {
            to: {
                bits: () => amount * 8,
                kB: () => amount / 1024,
                mB: () => convert(amount).byte.to.kB() / 1024,
            },
        },
        Bps: {
            to: {
                Mbps: () => convert(convert(amount).byte.to.mB()).byte.to.bits(),
            }
        },

        seconds: {
            to: {
                millis: () => amount * 1000
            }
        }
    };
}

// https://stackoverflow.com/questions/18884249/checking-whether-something-is-iterable
export function iterable(obj: any): boolean {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }

    return typeof obj[Symbol.iterator] === 'function';
}

export function parseCookies(req: NextApiRequest) {
    const rawCookies = req.headers.cookie?.split('; ') || []
    const parsedCookies: { [key: string]: string } = {}
    rawCookies.forEach(rawCookie => {
        const [key, value] = rawCookie.split('=')
        parsedCookies[key] = value
    })
    return parsedCookies
}