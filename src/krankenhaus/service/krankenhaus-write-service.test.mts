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
