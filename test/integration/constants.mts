import { paths } from '../../src/config/paths.mts';
import { serverConfig } from '../../src/config/server.mts';

const { host, port } = serverConfig;

export const baseURL = `https://${host}:${port}`;
export const restURL = `${baseURL}/rest`;

export const tokenPath = `${paths.auth}${paths.token}`;

export const POST = 'POST';

export const APPLICATION_JSON = 'application/json';

export const CONTENT_TYPE = 'Content-Type';
export const IF_NONE_MATCH = 'If-None-Match';
export const AUTHORIZATION = 'Authorization';
export const LOCATION = 'Location';

export const BEARER = 'Bearer';
export const X_WWW_FORM_URL_ENCODED = 'application/x-www-form-urlencoded';
