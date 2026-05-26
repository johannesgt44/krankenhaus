import {
    type KrankenhausMitAdresseUndFachbereiche,
    KrankenhausService,
} from './krankenhaus-service.mts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PrismaClient } from '../../../generated/prisma/client.ts';

const { findUniqueMock } = vi.hoisted(() => {
    return {
        findUniqueMock: vi.fn<PrismaClient['krankenhaus']['findUnique']>(),
    };
});

vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            krankenhaus: {
                findUnique: findUniqueMock,
            },
        } as unknown as PrismaClient,
    };
});

describe('KrankenhausService findById', () => {
    let service: KrankenhausService;

    beforeEach(() => {
        service = new KrankenhausService();
        findUniqueMock.mockReset();
    });

    test('id vorhanden', async () => {
        // given
        const id = 1;
        const krankenhausMock: Readonly<KrankenhausMitAdresseUndFachbereiche> =
            {
                id,
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
                    krankenhausId: id,
                },
                fachbereiche: [],
            };
        findUniqueMock.mockResolvedValue(krankenhausMock);

        // when
        const krankenhaus = await service.findById({ id });

        // then
        expect(krankenhaus).toStrictEqual(krankenhausMock);
    });

    test('id nicht vorhanden', async () => {
        // given
        const id = 999;
        findUniqueMock.mockResolvedValue(null);

        // when / then
        await expect(service.findById({ id })).rejects.toThrow(
            `Krankenhaus mit id=${id} nicht gefunden`,
        );
    });
});
