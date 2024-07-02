import {
    Cache,
    CacheMetadata
} from "./types";

import {
    writeFile,
    readFile,
} from "./filesystem"

import {
    verbose as log
} from "./logger";

import fs from 'fs';

let caches: Cache = {};
let cachesMetadata: CacheMetadata = {};
const expireCache: number = Number(process.env.CACHE_MAX_LIFETIME);

export function create(id: string, path?: string | null): void {
    // check if cache is expired
    if (cachesMetadata[id]) {
        // if cache is expired, reset it
        const expireDate = new Date(cachesMetadata[id].expire);
        const currentDate = new Date();
        if (currentDate > expireDate) {
            log(`Cache ${id} is expired, resetting it...`);
            deleteCache(id);
        }
    }

    // then attempt to create metadata
    if (!cachesMetadata[id]) {
        // ???????????????????????? why in the args then.... idk, i don't care. SEE YA
        path = `./cache/${id}.json`;
        try {
            // check if metadata exists on disk first
            const data = fs.readFileSync(`./cache/${id}.meta.json`, 'utf8');
            cachesMetadata[id] = JSON.parse(data);
            log(`Cache ${id} metadata loaded from disk`)
        } catch (e) {
            const createDate = new Date().toISOString();
            // ad 1 week to the current date
            const expireDate = new Date(new Date().getTime() + expireCache * 24 * 60 * 60 * 1000).toISOString();
            cachesMetadata[id] = {
                path,
                created: createDate,
                expire: expireDate
            };
            // save metadata to disk
            const metaPath = `./cache/${id}.meta.json`;
            writeFile(metaPath, JSON.stringify(caches[id], null, 2), 'utf8');
            log(`Cache ${id} metadata created`)
        }
    }

    // then attempt to create cache
    if (!caches[id]) {
        log(`Cache ${id} does not exist, creating it...`);
        // check if cache exists on disk first
        try {
            const data = fs.readFileSync(cachesMetadata[id].path, 'utf8');
            caches[id] = JSON.parse(data);
            log(`Cache ${id} loaded from disk`)
        } catch (e) {
            caches[id] = [];
            log(`Cache ${id} created`)
        }
    }
}

export function get(id: string, path?: string | null): Cache[string] {
    create(id, path);
    return caches[id];
}

export function set(id: string, path: string | null, data: Cache[string]): void {
    create(id, path);
    caches[id] = data;
}

export function deleteCache(id: string): void {
    caches[id] = [];
    cachesMetadata[id] = {};

    // delete the file if it exists
    try {
        if (fs.existsSync(cachesMetadata[id].path)) {
            fs.unlinkSync(cachesMetadata[id].path);
        }
    } catch (e) {
        console.error(e);
    }
}

function getMetadata(id: string): CacheMetadata[string] {
    return cachesMetadata[id];
}

export async function reset(id: string): Promise<void> {
    const meta = getMetadata(id);
    // clear and read from file
    caches[id] = [];
    // read from file
    const data = await readFile(meta.path, 'utf8');
    caches[id] = JSON.parse(data);
}

export function add(id: string, page: string, data: string): void {
    if (find(id, page)) return console.warn(`Page ${page} already exists in cache ${id}`);
    caches[id].push({ page, data });
}

export async function save(id: string): Promise<void> {
    const meta = getMetadata(id);
    await writeFile
        (meta.path, JSON.stringify(caches[id], null, 2), 'utf8');
}

export function saveAll(): void {
    Object.keys(caches).forEach((id) => {
        save(id);
    });
}

export function isExpired(id: string): boolean {
    const expireDate = new Date(cachesMetadata[id].expire);
    const currentDate = new Date();
    return currentDate > expireDate;
}

export function dump(id?: string | undefined | null): void {
    if (id) {
        log(`Cache ${id}:`);
        log(caches[id]);
        return;
    }

    Object.keys(caches).forEach((id) => {
        log(`Cache ${id}:`);
        log(caches[id]);
    });
}

export function find(id: string, page: string): Cache[string][0] | undefined {
    return caches[id].find((item: any) => item.page === page);
}