export interface Dict<T> {
    [key: string]: T;
}

export type ClipDataResponse = {
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
    duration: number,
    view_count: number,
    created_at: string,
    thumbnail_url: string
}

export type ClipData = {
    // Define the type of your clip data here
    data: ClipDataResponse[]
    pagination: {
        cursor: string
    }
}

export type Period = {
    left: Date,
    right: Date,
}

export type ClipRequest = {
    broadcaster_id: string,
    first: string,
    after: string | undefined | null,
    started_at: string | undefined | null,
    ended_at: string | undefined | null,
}

export type AuthData = {
    access_token: string,
    refresh_token: string,
    user_id: string
}

export type Cache = {
    [key: string]: [
        {
            page: string,
            data: string
        }
    ] | any
};

export type CacheMetadata = {
    [key: string]: {
        path: string,
    }
};

export interface YoutubeDlClipDump {
    'http_headers': YoutubeDlDumpHttpHeaders,
    'thumbnail': string,
    'webpage_url_basename': string,
    'uploader': string,
    'uploader_id': string,
    'fps': number,
    'protocol': string,
    'id': string,
    'format': string,
    'views': number,
    'display_id': string,
    'upload_date': string,
    'requested_subtitles': any,
    'formats': YoutubeDlClipDumpFormats[],
    'extractor': string,
    'format_id': string,
    'ext': string,
    'webpage_url': string,
    'thumbnails': YoutubeDlClipDumpThumbnails[],
    'timestamp': number,
    'fulltitle': string,
    'playlist': any,
    'extractor_key': string,
    'creator': string,
    'height': number,
    'url': string,
    'playlist_index': any,
    '_filename': string,
    'duration': number,
    'title': string
}

export interface YoutubeDlDumpHttpHeaders {
    'Accept-Charset': string,
    'Accept': string,
    'User-Agent': string,
    'Accept-Encoding': string,
    'Accept-Language': string
}

export interface YoutubeDlClipDumpFormats {
    'ext': string,
    'height': number,
    'http_headers': YoutubeDlDumpHttpHeaders,
    'format_id': string,
    'protocol': string,
    'fps': number,
    'url': string,
    'format': string
}

export interface YoutubeDlClipDumpThumbnails {
    'width': number,
    'height': number,
    'resolution': string,
    'url': string,
    'id': string
}

export interface YoutubeDlClipDump {
    'http_headers': YoutubeDlDumpHttpHeaders,
    'thumbnail': string,
    'webpage_url_basename': string,
    'uploader': string,
    'uploader_id': string,
    'fps': number,
    'protocol': string,
    'id': string,
    'format': string,
    'views': number,
    'display_id': string,
    'upload_date': string,
    'requested_subtitles': any,
    'formats': YoutubeDlClipDumpFormats[],
    'extractor': string,
    'format_id': string,
    'ext': string,
    'webpage_url': string,
    'thumbnails': YoutubeDlClipDumpThumbnails[],
    'timestamp': number,
    'fulltitle': string,
    'playlist': any,
    'extractor_key': string,
    'creator': string,
    'height': number,
    'url': string,
    'playlist_index': any,
    '_filename': string,
    'duration': number,
    'title': string
}