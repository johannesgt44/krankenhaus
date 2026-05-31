import { AUTHORIZATION, BEARER, DELETE, restURL } from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { getToken } from '../token.mts';

const idVorhanden = 50;

describe('DELETE /rest/:id', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('Vorhandenes Krankenhaus loeschen', async () => {
        // given
        const url = `${restURL}/${idVorhanden}`;
        const headers = new Headers();
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: DELETE,
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(204);

        const body = await response.text();
        expect(body).toBe('');
    });
});
