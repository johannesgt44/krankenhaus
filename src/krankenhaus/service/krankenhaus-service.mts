/**
 * Das Modul `krankenhaus-service` besteht aus der Klasse {@linkcode KrankenhausService}.
 * @packageDocumentation
 */

import { type Prisma } from '../../../generated/prisma/client.ts';
import { type KrankenhausInclude } from '../../../generated/prisma/models/Krankenhaus.ts';
import { NotFoundError } from './errors.mts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';

type FindByIdParams = {
    readonly id: number;
    readonly mitFachbereiche?: boolean;
};

export type KrankenhausMitAdresse = Prisma.KrankenhausGetPayload<{
    include: { adresse: true; }
}>;

export type KrankenhausMitAdresseUndFachbereiche = Prisma.KrankenhausGetPayload<{
    include: {
        adresse: true;
        fachbereiche: true;
    }
}>;

/**
 * Die Klasse `KrankenhausService` bietet Methoden für die Suche von Krankenhäusern
 * und nutzt _Prisma_ als ORM für die Datenbankabfragen.
 */
export class KrankenhausService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #includeAdresse: KrankenhausInclude = { adresse: true };
    readonly #includeAdresseUndFachbereiche: KrankenhausInclude = {
        adresse: true,
        fachbereiche: true,
    };

    readonly #logger = getLogger(KrankenhausService.name);

    /**
     * Ein Krankenhaus asynchron anhand seiner ID suchen.
     * @param id Die ID des zu suchenden Krankenhauses
     * @returns Das gefundene Krankenhaus oder `null`, wenn kein Krankenhaus mit der angegebenen ID gefunden wurde.
     */
    async findById({
        id,
        mitFachbereiche,
    }: FindByIdParams): Promise<Readonly<KrankenhausMitAdresseUndFachbereiche>> {
        this.#logger.debug('findById: id=%d', id);

        const include = mitFachbereiche
            ? this.#includeAdresseUndFachbereiche
            : this.#includeAdresse;

        const krankenhaus: KrankenhausMitAdresseUndFachbereiche | null =
            await prismaClient.krankenhaus.findUnique({
                where: { id },
                include,
            });
        if (krankenhaus == null) {
            this.#logger.debug('findById: Krankenhaus mit id=%d nicht gefunden', id);
            throw new NotFoundError(`Krankenhaus mit id=${id} nicht gefunden`);
        }
        this.#logger.debug('findById: krankenhaus=%o', krankenhaus);
        return krankenhaus;
    }
}
