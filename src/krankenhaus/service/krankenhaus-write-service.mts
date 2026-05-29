import {
    EmailExistsError,
    NotFoundError,
    VersionInvalidError,
    VersionOutdatedError,
} from './errors.mts';
import { type Prisma } from '../../../generated/prisma/client.ts';
import { KrankenhausService } from './krankenhaus-service.mts';
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
    readonly id: number | undefined;
    /** Krankenhaus-Objekt mit den aktualisierten Werten. */
    readonly krankenhaus: KrankenhausUpdate;
    /** Versionsnummer fuer die zu aktualisierenden Werte. */
    readonly version: string;
};
type KrankenhausUpdated = Prisma.KrankenhausGetPayload<{}>;

export class KrankenhausWriteService {
    private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

    readonly #readService: KrankenhausService;

    readonly #logger = getLogger(KrankenhausWriteService.name);

    constructor(readService: KrankenhausService) {
        this.#readService = readService;
    }

    // neues Krankenhaus anlegen
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

    async update({ id, krankenhaus, version }: UpdateParams) {
        this.#logger.debug(
            'update: id=%s, krankenhaus=%o, version=%s',
            id,
            krankenhaus,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: id ist undefined');
            throw new NotFoundError(
                `Es gibt kein Krankenhaus mit dieser ID ${id}.`,
            );
        }

        await this.#validateUpdate(id, version);

        krankenhaus.version = { increment: 1 };
        let krankenhausUpdated: KrankenhausUpdated | undefined;
        await prismaClient.$transaction(async (tx) => {
            krankenhausUpdated = await tx.krankenhaus.update({
                data: krankenhaus,
                where: { id },
            });
        });
        this.#logger.debug(
            'update: krankenhausUpdated=%s',
            JSON.stringify(krankenhausUpdated),
        );

        return krankenhausUpdated?.version ?? Number.NaN;
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

    async #validateUpdate(id: number, versionStr: string) {
        this.#logger.debug(
            '#validateUpdate: id=%d, versionStr=%s',
            id,
            versionStr,
        );
        if (!KrankenhausWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidError(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);
        const krankenhausDb = await this.#readService.findById({ id });

        if (version < krankenhausDb.version) {
            this.#logger.debug('#validateUpdate: versionDb=%d', version);
            throw new VersionOutdatedError(version);
        }
    }
}
