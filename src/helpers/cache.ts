import {
    Cache,
    CacheMetadata
} from "./types";

import {
    writeFile,
    readFile,
} from "./filesystem"

import fs from 'fs';

let caches: Cache = {};
let cachesMetadata: CacheMetadata = {}

export function create(id: string, path?: string | null): void {
    if (!cachesMetadata[id]) {
        path = `./cache/${id}.json`;
        cachesMetadata[id] = { path };
    }

    if (!caches[id]) {
        console.warn(`Cache ${id} does not exist, creating it...`);
        // check if cache exists on disk first
        try {
            const data = fs.readFileSync(cachesMetadata[id].path, 'utf8');
            caches[id] = JSON.parse(data);
            console.log(`Cache ${id} loaded from disk`)
        } catch (e) {
            caches[id] = [];
            console.log(`Cache ${id} created`)
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

export function clear(): void {
    caches = {};
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

export function dump(id?: string | undefined | null): void {
    if (id) {
        console.log(`Cache ${id}:`);
        console.log(caches[id]);
        return;
    }

    Object.keys(caches).forEach((id) => {
        console.log(`Cache ${id}:`);
        console.log(caches[id]);
    });
}

export function find(id: string, page: string): Cache[string][0] | undefined {
    return caches[id].find((item) => item.page === page);
}