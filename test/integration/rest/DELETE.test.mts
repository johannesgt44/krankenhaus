import { AUTHORIZATION, BEARER, DELETE, restURL } from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { getToken } from '../token.mts';

//Testdaten
const id = '50';

//Test
describe('DELETE /rest', () => {
    let token: string;
    let tokenUser: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
        tokenUser = await getToken('user', 'p');
    });

    test.concurrent('Vorhandenes Krankenhaus loeschen', async () => {
        // given
        const url = `${restURL}/${id}`;
        const headers = new Headers();
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const { status } = await fetch(url, {
            method: DELETE,
            headers,
        });

        // then
        expect(status).toBe(204);
    });
});
