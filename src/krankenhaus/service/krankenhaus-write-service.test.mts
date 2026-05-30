import {
    type KrankenhausCreate,
    KrankenhausWriteService,
} from './krankenhaus-write-service.mts';
import { Prisma, PrismaClient } from '../../../generated/prisma/client.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KrankenhausService } from './krankenhaus-service.mts';

// Hoisting: wird an den (Datei-) Anfang verschoben
const { createMock, countMock, transactionMock, sendmailMock } = vi.hoisted(
    () => {
        return {
            createMock: vi.fn<Prisma.KrankenhausDelegate['create']>(),
            countMock: vi.fn<Prisma.KrankenhausDelegate['count']>(),
            transactionMock: vi.fn(), // oxlint-disable-line vitest/require-mock-type-parameters
            sendmailMock: vi.fn(), // oxlint-disable-line vitest/require-mock-type-parameters
        };
    },
);

// vi.mock() bewirkt Hoisting
vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            krankenhaus: {
                create: createMock,
                count: countMock,
            },
            $transaction: transactionMock,
        } as unknown as PrismaClient,
    };
});

vi.mock(import('../../mail/sendmail.mts'), () => {
    return {
        sendmail: sendmailMock,
    };
});

describe('KrankenhausWriteService create', () => {
    let service: KrankenhausWriteService;
    let readService: KrankenhausService;

    beforeEach(() => {
        readService = new KrankenhausService();
        service = new KrankenhausWriteService(readService);

        createMock.mockReset();
        countMock.mockReset();
        transactionMock.mockReset();
        sendmailMock.mockReset();

        transactionMock.mockImplementation(
            async (
                transactionBody: (
                    tx: Prisma.TransactionClient,
                ) => Promise<unknown>,
            ) =>
                await transactionBody({
                    krankenhaus: {
                        create: createMock,
                        count: countMock,
                    },
                } as unknown as Prisma.TransactionClient),
        );
    });

    test('Neues Krankenhaus', async () => {
        // given
        const idMock = 1;
        const krankenhaus: KrankenhausCreate = {
            version: 0,
            name: 'Krankenhaus Test',
            mitarbeiteranzahl: 100,
            bettenanzahl: 50,
            email: 'test@krankenhaus.de',
            adresse: {
                create: {
                    strasse: 'Teststrasse',
                    hausnummer: '1',
                    plz: '12345',
                    ort: 'Teststadt',
                },
            },
            fachbereiche: {
                create: [],
            },
        };
        const krankenhausTmp: any = { ...krankenhaus };
        krankenhausTmp.id = idMock;
        krankenhausTmp.erzeugt = new Date();
        krankenhausTmp.aktualisiert = new Date();
        krankenhausTmp.adresse.create.id = 11;
        krankenhausTmp.adresse.create.krankenhausId = idMock;
        // return von tx.krankenhaus.create()
        countMock.mockResolvedValue(0);
        createMock.mockResolvedValue(krankenhausTmp);
        // sendmail ist eine void-Funktion
        sendmailMock.mockResolvedValue(null);

        // when
        const id = await service.create(krankenhaus);

        // then
        expect(id).toBe(idMock);
        expect(sendmailMock).toHaveBeenCalledOnce();
    });
});
