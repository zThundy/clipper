
import {
    ensureDirectoryExists,
    append,
    write,
    existsSync,
} from './filesystem';

import {
    appPath,
} from './utils';

// create folder logs if it does not exist
ensureDirectoryExists(appPath('logs'));

const getCurrentDate = (): string => {
    const date = new Date();
    return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
    ].join('-');
}

// create log file if not exists
const logPath = appPath(`logs/${getCurrentDate()}_log.log`);
if (!existsSync(logPath)) {
    write(logPath, '');
}

export function verbose(args: any[] | string[] | string): void {
    if (process.env.LOG_LEVEL !== 'verbose') return;
    console.log(args);
    writeLog("VERBOSE", args);
}

export function log(args: any[] | string[] | string): void {
    console.log(args);
    writeLog("INFO", args);
}

export function warn(args: any[] | string[] | string): void {
    console.warn(args);
    writeLog("WARN", args);
}

export function error(args: any[] | string[] | string): void {
    console.error(args);
    writeLog("ERROR", args);
}

function writeLog(type: string, args: any[] | string): void {
    // get current date
    const date = new Date();
    // format date to DD/MM/YYYY HH:MM:SS format and add padding to single digit numbers
    const formattedDate = [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
    ].join('/');

    const formattedTime = [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
        date.getSeconds().toString().padStart(2, '0')
    ].join(':');

    const formattedDateTime = `${formattedDate} ${formattedTime}`;

    const log = Array.isArray(args) ? args.join(' ') : args;
    append(logPath, `${formattedDateTime} - [${type}]: ${log}\n`);
}