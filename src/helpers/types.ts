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
    after: string,
    started_at: string | undefined | null,
    ended_at: string | undefined | null,
}

export type AuthData = {
    access_token: string,
    refresh_token: string,
    user_id: string
}