import {
    ACCEPT,
    APPLICATION_JSON,
    CONTENT_TYPE,
    GRAPHQL_RESPONSE_JSON,
    POST,
    graphqlURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { type GraphQLQuery } from './graphql.mts';
import { type Prisma } from '../../../generated/prisma/client.ts';

export type KrankenhausDTO = Omit<
    Prisma.KrankenhausGetPayload<{
        include: {
            adresse: true;
        };
    }>,
    'aktualisiert' | 'erzeugt'
>;

type KrankenhausSuccessType = {
    data: { krankenhaus: KrankenhausDTO };
    errors?: undefined;
};
type KrankenhaeuserSuccessType = {
    data: { krankenhaeuser: KrankenhausDTO[] };
    errors?: undefined;
};

export type ErrorsType = {
    message: string;
    path: string[];
    extensions: { code: string };
}[];
type KrankenhausErrorsType = {
    data: { krankenhaus: null };
    errors: ErrorsType;
};

// -----------------------------------------------------------------------------
// Testdaten
// -----------------------------------------------------------------------------
const ERSTE_ID = 10;
const ZWEITE_ID = 20;
const ids = [ERSTE_ID, ZWEITE_ID];
const orte = ['musterstadt', 'beispielstadt'];

let headers: Headers;

const testKrankenhausZuId = async (id: number) => {
    // given
    const query: GraphQLQuery = {
        query: `
            {
                krankenhaus(id: "${id}") {
                    version
                    name
                    mitarbeiteranzahl
                    bettenanzahl
                    email
                    adresse {
                        strasse
                        hausnummer
                        plz
                        ort
                    }
                }
            }
        `,
    };

    // when
    const response = await fetch(graphqlURL, {
        method: POST,
        body: JSON.stringify(query),
        headers,
    });

    //then
    const { status } = response;

    expect(status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(
        /application\/graphql-response\+json/iu,
    );

    const { data, errors } = (await response.json()) as KrankenhausSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { krankenhaus } = data;

    expect(krankenhaus.adresse?.ort).toBeDefined();
    expect(krankenhaus.version).toBeGreaterThan(-1);
    expect(krankenhaus.id).toBeUndefined();
};

const testKrankenhausZuNichtVorhandenerId = async () => {
    // given
    const id = '99';
    const query: GraphQLQuery = {
        query: `
            {
                krankenhaus(id: "${id}") {
                    adresse {
                        ort
                    }
                }
            }
        `,
    };

    // when
    const response = await fetch(graphqlURL, {
        method: POST,
        body: JSON.stringify(query),
        headers,
    });

    //then
    const { status } = response;

    expect(status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(
        /application\/graphql-response\+json/iu,
    );

    const { data, errors } = (await response.json()) as KrankenhausErrorsType;

    expect(errors).toHaveLength(1);
    expect(data).toBeNull();

    const [error] = errors;
    const { message, path, extensions } = error!;

    expect(message).toBe(`Krankenhaus mit id=${id} nicht gefunden`);
    expect(path).toBeDefined();
    expect(path![0]).toBe('krankenhaus');
    expect(extensions).toBeDefined();
    expect(extensions!.code).toBe('BAD_USER_INPUT');
};

const testKrankenhausZuOrt = async (ortFilter: string) => {
    // given
    const query: GraphQLQuery = {
        query: `
            {
                krankenhaeuser(input: {
                    ort: "${ortFilter}"
                }) {
                    adresse {
                        ort
                    }
                }
            }
        `,
    };

    // when
    const response = await fetch(graphqlURL, {
        method: POST,
        body: JSON.stringify(query),
        headers,
    });

    //then
    const { status } = response;

    expect(status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(
        /application\/graphql-response\+json/iu,
    );

    const { data, errors } =
        (await response.json()) as KrankenhaeuserSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { krankenhaeuser } = data;

    expect(krankenhaeuser).not.toHaveLength(0);

    krankenhaeuser
        .map((krankenhaus) => krankenhaus.adresse)
        .forEach((adresse) =>
            expect(adresse?.ort?.toLowerCase()).toStrictEqual(
                expect.stringContaining(ortFilter.toLowerCase()),
            ),
        );
};

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
describe('GraphQL Queries', () => {
    beforeAll(() => {
        headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
    });

    test.concurrent.each(ids)('Krankenhaus zu ID %i', async (id) => {
        expect.hasAssertions();
        await testKrankenhausZuId(id);
    });
    test.concurrent('Krankenhaus zu nicht vorhandener ID', async () => {
        expect.hasAssertions();
        await testKrankenhausZuNichtVorhandenerId();
    });
    test.concurrent.each(orte)('Krankenhaus zu Ort %s', async (ortFilter) => {
        expect.hasAssertions();
        await testKrankenhausZuOrt(ortFilter);
    });
});
