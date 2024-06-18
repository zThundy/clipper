import {
    WriteableCache,
    Cache
} from "./types";

import {
    writeFile,
    readFile,
} from "./filesystem"

let caches: Cache = {}

export function create(id: string): void {
    if (!caches[id]) {
        caches[id] = [];
    }
}

export function get(id: string): WriteableCache | [] {
    create(id);
    return caches[id];
}

export function set(id: string, data: WriteableCache): void {
    create(id);
    caches[id] = data;
}

export function clear(): void {
    caches = {};
}

export async function reset(id: string): Promise<void> {
    // clear and read from file
    caches[id] = [];
    // read from file
    caches[id] = JSON.parse((await readFile(`./cache/${id}.json`)).toString())
}

export function add(id: string, page: string, cursor: string): void {
    if (find(id, page)) return;
    caches[id].push({ page, cursor });
}

export function write(id: string): void {
    // write to file
    writeFile(`./cache/${id}.json`, JSON.stringify(caches[id], null, 2));
}

export function find(id: string, page: string): boolean {
    return caches[id].find((cache) => cache.page === page) !== undefined;
}