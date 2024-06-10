import fs from 'fs';
import { promisify } from 'util';
import { appPath } from './utils';

export const access = promisify(fs.access);
export const write = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export function existsSync(filePath: string): boolean {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);

        return true;
    } catch (e) {
        return false;
    }
}

export function ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
        console.log(`[fileSystem] Could not find "${directory}", creating it...`);
        fs.mkdirSync(directory, { recursive: true });
    } else {
        console.log(`[fileSystem] "${directory}" directory found!`);
    }
}

export function ensureAppDirectoryExists(directory: string): void {
    ensureDirectoryExists(appPath(directory));
}

export async function exists(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            // throws if it doesn't exist
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) return resolve(false);
                resolve(true);
            });
        } catch (error) {
            reject(false);
        }
    });
}
