import { NextApiRequest, NextApiResponse } from 'next';

import {
    parseCookies
} from '@/helpers/utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        // get the page number from the url query
        const { access_token, refresh_token, user_data } = parseCookies(req);
        // get date from the url query
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
    } else {
        res.status(405).json({
            type: "error",
            redirect: true,
            redirectPath: "/",
            message: "Method Not Allowed"
        } as any);
    }
}