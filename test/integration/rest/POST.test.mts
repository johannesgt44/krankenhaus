// oxlint-disable max-lines-per-function

import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    LOCATION,
    POST,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { type KrankenhausNeuType } from '../../../src/krankenhaus/router/krankenhaus-validation.mts';
import { KrankenhausService } from '../../../src/krankenhaus/service/krankenhaus-service.mts';
import { type ProblemDetails } from '../../../src/problem-details.mts';
import { getToken } from '../token.mts';

type ValidationIssue = {
    readonly path: readonly (number | string)[];
};

//Testdaten

const neuesKrankenhaus: KrankenhausNeuType = {
    name: 'Krankenhaus Test',
    mitarbeiteranzahl: 100,
    bettenanzahl: 50,
    email: 'post-test@krankenhaus.de',
    adresse: {
        strasse: 'Teststrasse',
        hausnummer: '1',
        plz: '12345',
        ort: 'Teststadt',
    },
    fachbereiche: [{ name: 'Chirurgie' }],
};

const neuesKrankenhausInvalid: Record<string, unknown> = {
    name: '',
    mitarbeiteranzahl: -100,
    bettenanzahl: -50,
    email: 'test2@',
    adresse: {
        strasse: 'Teststrasse',
        hausnummer: '1',
        plz: '12345',
        ort: 'Teststadt',
    },
    fachbereiche: [{ name: 'Chirurgie' }],
};

//Test

describe('POST /rest', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('Neues Krankenhaus anlegen', async () => {
        // given
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(restURL, {
            method: POST,
            headers,
            body: JSON.stringify(neuesKrankenhaus),
        });

        // then
        const { status } = response;

        expect(status).toBe(201);

        const location = response.headers.get(LOCATION);

        expect(location).toBeDefined();

        const indexLastSlash = location?.lastIndexOf('/') ?? -1;

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location?.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(KrankenhausService.ID_PATTERN.test(idStr ?? '')).toBe(true);
    });

    test('Neues Krankenhaus mit ungueltigen Daten nicht anlegen', async () => {
        // given
        const headers = new Headers();
        headers.set(CONTENT_TYPE, APPLICATION_JSON);
        headers.set(AUTHORIZATION, `${BEARER} ${token}`);

        const expectedPaths = [
            'name',
            'mitarbeiteranzahl',
            'bettenanzahl',
            'email',
        ];

        // when
        const response = await fetch(restURL, {
            method: POST,
            headers,
            body: JSON.stringify(neuesKrankenhausInvalid),
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
