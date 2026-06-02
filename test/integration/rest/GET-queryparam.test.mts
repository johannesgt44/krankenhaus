// oxlint-disable max-lines-per-function
import { CONTENT_TYPE, restURL } from '../constants.mts';
import { describe, expect, test } from 'vitest';
import { Krankenhaus } from '../../../generated/prisma/client.ts';
import { KrankenhausMitAdresse } from '../../../src/krankenhaus/service/krankenhaus-service.mts';
import { type Page } from '../../../src/krankenhaus/router/page.mts';

// -----------------------------------------------------------------------------
// Testdaten
// -----------------------------------------------------------------------------
const ortArray = ['Musterstadt', 'Teststadt'];
const ortNichtVorhanden = ['Hayna', 'Nirgends'];
const mitarbeiteranzahlArray = ['300'];
const bettenanzahlArray = ['800'];

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
describe('GET /rest', () => {
    test.concurrent('Alle Krankenhaeuser', async () => {
        // given
        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        // when
        const response = await fetch(restURL, { headers: requestHeaders });
        const { status, headers } = response;

        // then
        expect(status).toBe(200);
        expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

        const body = (await response.json()) as Page<Krankenhaus>;

        body.content
            .map((krankenhaus) => krankenhaus.id)
            .forEach((id) => {
                expect(id).toBeDefined();
            });
    });

    test.concurrent.each(ortArray)(
        'Krankenhaeuser mit Ort %s suchen',
        async (ort) => {
            // given
            const params = new URLSearchParams({ ort });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');

            // when
            const response = await fetch(url, { headers: requestHeaders });
            const { status, headers } = response;

            // then
            expect(status).toBe(200);
            expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

            const body = (await response.json()) as Page<KrankenhausMitAdresse>;

            expect(body).toBeDefined();

            body.content
                .map((krankenhaus) => krankenhaus.adresse)
                .forEach((ad) =>
                    expect(ad?.ort).toStrictEqual(expect.stringContaining(ort)),
                );
        },
    );

    test.concurrent.each(ortNichtVorhanden)(
        'Krankenhaeuser mit nicht vorhandenem Ort %s suchen',
        async (ort) => {
            // given
            const params = new URLSearchParams({ ort });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');

            // when
            const { status } = await fetch(url, { headers: requestHeaders });

            // then
            expect(status).toBe(404);
        },
    );

    test.concurrent.each(mitarbeiteranzahlArray)(
        'Krankenhaeuser mit Mitarbeiteranzahl %s suchen',
        async (mitarbeiteranzahl) => {
            // given
            const params = new URLSearchParams({ mitarbeiteranzahl });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');

            // when
            const response = await fetch(url, { headers: requestHeaders });
            const { status, headers } = response;

            // then
            expect(status).toBe(200);
            expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

            const body = (await response.json()) as Page<KrankenhausMitAdresse>;

            expect(body).toBeDefined();

            body.content
                .map((krankenhaus) => krankenhaus)
                .forEach((krank) =>
                    expect(krank.mitarbeiteranzahl?.toString()).toStrictEqual(
                        mitarbeiteranzahl,
                    ),
                );
        },
    );

    test.concurrent.each(bettenanzahlArray)(
        'Krankenhaeuser mit Bettenanzahl %s suchen',
        async (bettenanzahl) => {
            // given
            const params = new URLSearchParams({ bettenanzahl });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append('Accept', 'application/json');

            // when
            const response = await fetch(url, { headers: requestHeaders });
            const { status, headers } = response;

            // then
            expect(status).toBe(200);
            expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

            const body = (await response.json()) as Page<KrankenhausMitAdresse>;

            expect(body).toBeDefined();

            body.content
                .map((krankenhaus) => krankenhaus)
                .forEach((krank) =>
                    expect(krank.bettenanzahl?.toString()).toStrictEqual(
                        bettenanzahl,
                    ),
                );
        },
    );

    test.concurrent('Keine Krankenhaeuser zu einer nicht-vorhandenen Property', async () => {
        // given
        const params = new URLSearchParams({ foo: 'patient' });
        const url = `${restURL}?${params}`;
        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        // when
        const { status } = await fetch(url, { headers: requestHeaders });

        // then
        expect(status).toBe(404);
    });
});
