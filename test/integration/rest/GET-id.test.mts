// oxlint-disable max-lines-per-function
// oxlint-disable no-magic-numbers

import { CONTENT_TYPE, IF_NONE_MATCH, restURL } from '../constants.mts';
import { describe, expect, test } from 'vitest';

const ids = [10, 20];
const idNichtVorhanden = 999;
const idsETag = [10, 20];
const idFalsch = 'xyz';

describe('GET /rest/:id', () => {
    test.concurrent.each(ids)(
        'Krankenhaus zu vorhandener ID %d',
        async (id) => {
            // given
            const url = `${restURL}/${id}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');

            // when
            const response = await fetch(url, { headers: requestHeaders });
            const { status, headers } = response;

            // then
            expect(status).toBe(200);
            expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

            const krankenhaus = (await response.json()) as { id: number };
            expect(krankenhaus.id).toBe(id);
        },
    );

    test.concurrent('Kein Krankenhaus zu nicht-vorhandener Id', async () => {
        //given
        const url = `${restURL}/${idNichtVorhanden}`;
        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        // when
        const { status } = await fetch(url, { headers: requestHeaders });

        // then
        expect(status).toBe(404);
    });

    test.concurrent('Kein Krankenhaus falscher Id', async () => {
        //given
        const url = `${restURL}/${idFalsch}`;
        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        // when
        const { status } = await fetch(url, { headers: requestHeaders });

        // then
        expect(status).toBe(404);
    });

    test.concurrent.each(idsETag)(
        `Krankenhaus zu Id %i mit ${IF_NONE_MATCH}`,
        async (id) => {
            //given
            const url = `${restURL}/${id}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');
            requestHeaders.append(IF_NONE_MATCH, `"0"`);

            // when
            const response = await fetch(url, { headers: requestHeaders });
            const { status } = response;

            // then
            expect(status).toBe(304);

            const body = await response.text();
            expect(body).toBe('');
        },
    );
});
