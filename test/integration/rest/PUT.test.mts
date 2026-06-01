// oxlint-disable max-lines-per-function

import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    ETAG,
    IF_MATCH,
    PUT,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { type KrankenhausUpdateType } from '../../../src/krankenhaus/router/krankenhaus-validation.mts';
import { type ProblemDetails } from '../../../src/problem-details.mts';
import { getToken } from '../token.mts';

type ValidationIssue = {
    readonly path: readonly (number | string)[];
};

const geaendertesKrankenhaus: KrankenhausUpdateType = {
    name: 'Krankenhaus Test Geaendert',
    mitarbeiteranzahl: 150,
    bettenanzahl: 75,
    email: 'put-test-geaendert@krankenhaus.de',
};
const idVorhanden = 20;

const krankenhausFuerNichtVorhandeneId: KrankenhausUpdateType = {
    name: 'Krankenhaus Nicht Vorhanden',
    mitarbeiteranzahl: 150,
    bettenanzahl: 75,
    email: 'put-test-nicht-vorhanden@krankenhaus.de',
};
const idNichtVorhanden = 9999;

const krankenhausInvalid: Record<string, unknown> = {
    name: '',
    mitarbeiteranzahl: -150,
    bettenanzahl: -75,
    email: 'put-test',
};

describe('PUT /rest/:id', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('Vorhandenes Krankenhaus aendern', async () => {
        // given
        const url = `${restURL}/${idVorhanden}`;
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);
        headers.set(IF_MATCH, '"0"');

        // when
        const response = await fetch(url, {
            method: PUT,
            headers,
            body: JSON.stringify(geaendertesKrankenhaus),
        });

        // then
        const { status } = response;

        expect(status).toBe(204);
        expect(response.headers.get(ETAG)).toBe('"1"');

        const body = await response.text();
        expect(body).toBe('');
    });

    test('Nicht vorhandenes Krankenhaus nicht aendern', async () => {
        // given
        const url = `${restURL}/${idNichtVorhanden}`;
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);
        headers.set(IF_MATCH, '"0"');

        // when
        const response = await fetch(url, {
            method: PUT,
            headers,
            body: JSON.stringify(krankenhausFuerNichtVorhandeneId),
        });

        // then
        const { status } = response;

        expect(status).toBe(404);
    });

    test(`Krankenhaus ohne ${IF_MATCH} nicht aendern`, async () => {
        // given
        const url = `${restURL}/${idVorhanden}`;
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: PUT,
            headers,
            body: JSON.stringify(geaendertesKrankenhaus),
        });

        // then
        const { status } = response;

        expect(status).toBe(428);

        const body = (await response.json()) as ProblemDetails;
        expect(body.detail).toBe('Header "If-Match" ist erforderlich.');
    });

    test('Krankenhaus mit ungueltigen Daten nicht aendern', async () => {
        // given
        const url = `${restURL}/${idVorhanden}`;
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);
        headers.set(IF_MATCH, '"0"');

        const expectedPaths = [
            'name',
            'mitarbeiteranzahl',
            'bettenanzahl',
            'email',
        ];

        // when
        const response = await fetch(url, {
            method: PUT,
            headers,
            body: JSON.stringify(krankenhausInvalid),
        });

        // then
        const { status } = response;

        expect(status).toBe(422);

        const body = (await response.json()) as ProblemDetails;
        const validationIssues = body.detail as ValidationIssue[];

        expect(validationIssues).toHaveLength(expectedPaths.length);

        const paths = validationIssues.flatMap(({ path }) => {
            const field = path.at(0);
            return typeof field === 'string' ? [field] : [];
        });

        expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
    });
});
