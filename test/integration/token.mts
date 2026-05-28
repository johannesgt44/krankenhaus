import {
    CONTENT_TYPE,
    POST,
    X_WWW_FORM_URL_ENCODED,
    baseURL,
    tokenPath,
} from './constants.mts';

export const getToken = async (username: string, password: string) => {
    const headers = new Headers();
    headers.append(CONTENT_TYPE, X_WWW_FORM_URL_ENCODED);
    const response = await fetch(`${baseURL}${tokenPath}`, {
        method: POST,
        body: `username=${username}&password=${password}`,
        headers,
    });

    const body = (await response.json()) as { access_token: string };
    if (
        response.status !== 200 ||
        body.access_token === undefined ||
        typeof body.access_token !== 'string'
    ) {
        throw new Error('Statuscode ist nicht 200 oder Token ist kein String');
    }
    return body.access_token;
};
