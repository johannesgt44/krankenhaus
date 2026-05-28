import { serverConfig } from '../../src/config/server.mts';

const { host, port } = serverConfig;

export const baseURL = `https://${host}:${port}`;
export const restURL = `${baseURL}/rest`;

export const POST = 'POST';

export const CONTENT_TYPE = 'Content-Type';
export const IF_NONE_MATCH = 'If-None-Match';
export const AUTHORIZATION = 'Authorization';

export const BEARER = 'Bearer';
