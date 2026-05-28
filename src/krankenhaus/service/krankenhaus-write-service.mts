import { EmailExistsError } from './errors.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';
import { sendmail } from '../../mail/sendmail.mts';

export type KrankenhausCreate = Prisma.KrankenhausCreateInput;
type KrankenhausCreated = Prisma.KrankenhausGetPayload<{
    include: {
        adresse: true;
        fachbereiche: true;
    };
}>;

export type KrankenhausUpdate = Prisma.KrankenhausUpdateInput;
/** Typdefinitionen zum Aktualisieren eines Krankenhauses mit `update`. */
export type UpdateParams = {
    /** ID des zu aktualisierenden Krankenhauses. */
    readonly id: number;
    /** Krankenhaus-Objekt mit den aktualisierten Werten. */
    readonly krankenhaus: KrankenhausUpdate;
    /** Versionsnummer fuer die zu aktualisierenden Werte. */
    readonly version: string;
};


