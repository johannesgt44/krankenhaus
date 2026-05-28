// oxlint-disable max-lines-per-function
import {
    type KrankenhausMitAdresseUndFachbereiche,
    KrankenhausService,
} from './krankenhaus-service.mts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type Pageable } from './pageable.mts';
import { PrismaClient } from '../../../generated/prisma/client.ts';

const { findManyMock, countMock } = vi.hoisted(() => {
    return {
        findManyMock: vi.fn<PrismaClient['krankenhaus']['findMany']>(),
        countMock: vi.fn<PrismaClient['krankenhaus']['count']>(),
    };
});

vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            krankenhaus: {
                findMany: findManyMock,
                count: countMock,
            },
        } as unknown as PrismaClient,
    };
});

describe('KrankenhausService find', () => {
    let service: KrankenhausService;

    beforeEach(() => {
        service = new KrankenhausService();
        findManyMock.mockReset();
        countMock.mockReset();
    });

    test('name vorhanden', async () => {
        //given
        const name = 'Krankenhaus Test';
        const suchparameter = { name };
        const pageable: Pageable = { number: 1, size: 5 };
        const krankenhausMock: Readonly<KrankenhausMitAdresseUndFachbereiche> =
            {
                id: 1,
                version: 0,
                name: 'Krankenhaus Test',
                mitarbeiteranzahl: 100,
                bettenanzahl: 50,
                email: 'test@krankenhaus.de',
                erzeugt: new Date(),
                aktualisiert: new Date(),
                adresse: {
                    id: 1,
                    strasse: 'Teststraße',
                    hausnummer: '1',
                    plz: '12345',
                    ort: 'Teststadt',
                    krankenhausId: 1,
                },
                fachbereiche: [],
            };
        findManyMock.mockResolvedValueOnce([krankenhausMock]);
        countMock.mockResolvedValueOnce(1);

        // when
        const result = await service.find(suchparameter, pageable);

        // then
        const { content } = result;

        expect(content).toHaveLength(1);
        expect(content[0]).toStrictEqual(krankenhausMock);
    });

    test('name nicht vorhanden', async () => {
        //given
        const name = 'Krankenhaus Test';
        const suchparameter = { name };
        const pageable: Pageable = { number: 1, size: 5 };
        findManyMock.mockResolvedValueOnce([]);
        countMock.mockResolvedValueOnce(0);

        // when / then
        await expect(service.find(suchparameter, pageable)).rejects.toThrow(
            `find:Keine Krankenhäuser gefunden {"name":"${name}"}`,
        );
    });
});
