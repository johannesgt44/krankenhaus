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

export class KrankenhausWriteService {
    readonly #logger = getLogger(KrankenhausWriteService.name);

    /**
     * Neues Krankenhaus soll angelegt werden.
     * @param krankenhaus Das neu abzulegende Krankenhaus
     * @returns Die ID des neu angelegten Krankenhauses
     * @throws EmailExists falls die Email-Adresse bereits existiert
     */
    async create(krankenhaus: KrankenhausCreate) {
        this.#logger.debug('create: krankenhaus=%o', krankenhaus);
        await this.#validateCreate(krankenhaus);

        // Neuer Datensatz mit generierter ID
        let krankenhausDb: KrankenhausCreated | undefined;
        await prismaClient.$transaction(async (tx) => {
            krankenhausDb = await tx.krankenhaus.create({
                data: krankenhaus,
                include: { adresse: true, fachbereiche: true },
            });
        });
        await KrankenhausWriteService.#sendmail({
            id: krankenhausDb?.id ?? 'N/A',
            name: krankenhausDb?.name ?? 'N/A',
        });

        this.#logger.debug('create: krankenhausDb.id=%s', krankenhausDb?.id);
        return krankenhausDb?.id ?? Number.NaN;
    }

    async #validateCreate({
        email,
    }: Prisma.KrankenhausCreateInput): Promise<undefined> {
        this.#logger.debug('#validateCreate: email=%s', email);

        const anzahl = await prismaClient.krankenhaus.count({
            where: { email },
        });
        if (anzahl > 0) {
            this.#logger.debug('#validateCreate: email existiert: %s', email);
            throw new EmailExistsError(email);
        }
        this.#logger.debug('#validateCreate: ok');
    }

    static async #sendmail({
        id,
        name,
    }: {
        id: number | 'N/A';
        name: string;
    }) {
        const subject = `Neues Krankenhaus ${id}`;
        const body = `Das Krankenhaus mit dem Namen <strong>${name}</strong> ist angelegt`;
        await sendmail({ subject, body });
    }
}
