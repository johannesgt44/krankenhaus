/**
 * Das Modul `krankenhaus-service` besteht aus der Klasse {@linkcode KrankenhausService}.
 * @packageDocumentation
 */

import { type Prisma } from '../../../generated/prisma/client.ts';
import { suchparameterNamen, type Suchparameter } from './suchparameter.mts';
import { type KrankenhausInclude } from '../../../generated/prisma/models/Krankenhaus.ts';
import { NotFoundError } from './errors.mts';
import { type Slice } from './slice.mts';
import { buildWhere } from './where-builder.mts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';
import { Pageable } from './pageable.mts';

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

    /**
     * Krankenhäuser asynchron anhand von Suchparametern suchen.
     * @param suchparameter JSON-Objekt mit den Suchparametern.
     * @param pageable Pageable-Objekt mit den Paginierungsinformationen.
     * @returns Slice mit den gefundenen Krankenhäusern und der Gesamtanzahl der gefundenen Krankenhäuser
     * @throws NotFoundError falls keine Krankenhäusern gefunden wurden.
     */
    async find(
        suchparameter: Suchparameter | null,
        pageable: Pageable
    ): Promise<Readonly<Slice<Readonly<KrankenhausMitAdresse>>>> {
        this.#logger.debug(
            'find: suchparameter=%s, pageable=%o',
            JSON.stringify(suchparameter),
            pageable,
        );

        if (suchparameter == null) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchparameter);
        if(keys.length === 0) {
            return await this.#findAll(pageable);
        }

        if (!this.#checkKeys(keys)) {
            this.#logger.debug('find: Ungültige Suchparameter');
            throw new NotFoundError('Ungültige Suchparameter');
        }

        const where = buildWhere(suchparameter);
        const { number, size } = pageable;
        const krankenhaeuser: KrankenhausMitAdresse[] =
            await prismaClient.krankenhaus.findMany({
                where,
                skip: number * size,
                take: size,
                include: this.#includeAdresse,
            });
        if (krankenhaeuser.length === 0) {
            this.#logger.debug('find: Keine Krankenhäuser gefunden');
            throw new NotFoundError(`find:Keine Krankenhäuser gefunden ${JSON.stringify(suchparameter)}`);
        }
        const totalElements = await this.count(where);
        return this.#createSlice(krankenhaeuser, totalElements);
    }

    /**
     * Anzahl der gefundenen Krankenhäuser zurückliefern.
     * @param WHERE-Klausel für die Suche nach Krankenhäusern.
     * @returns Anzahl der gefundenen Krankenhäuser.
     */
    async count(where?: Prisma.KrankenhausWhereInput) {
        this.#logger.debug('count: where=%o', where ?? 'undefined');
        const { count } = prismaClient.krankenhaus;
        const anzahl =
            where == undefined ? await count() : await count({ where });
        this.#logger.debug('count: anzahl=%d', anzahl);
        return anzahl;
    }

    async #findAll(
        pageable: Pageable
    ): Promise<Readonly<Slice<KrankenhausMitAdresse>>> {
        const { number, size } = pageable;
        const krankenhaeuser: KrankenhausMitAdresse[] = await prismaClient.krankenhaus.findMany({
            skip: number * size,
            take: size,
            include: this.#includeAdresse,
        });
        if (krankenhaeuser.length === 0) {
            this.#logger.debug('#findAll: Keine Krankenhäuser gefunden');
            throw new NotFoundError(`Ungueltige Seite "${number}"`);
        }
        const totalElements = await prismaClient.krankenhaus.count();
        return this.#createSlice(krankenhaeuser, totalElements);
    }

    #createSlice(
        krankenhaeuser: KrankenhausMitAdresse[],
        totalElements: number,
    ): Slice<Readonly<KrankenhausMitAdresse>> {
        const krankenhaeuserDTO = krankenhaeuser.map((krankenhaus) => {
            const { ...krankenhausRest } = krankenhaus;
            const krankenhausDTO: KrankenhausMitAdresse = {
                ...krankenhausRest,
            };
            return krankenhausDTO;
        });
        const krankenhausSlice: Slice<KrankenhausMitAdresse> = {
            content: krankenhaeuserDTO,
            totalElements,
        };
        this.#logger.debug('#createSlice: krankenhausSlice=%o', krankenhausSlice);
        return krankenhausSlice;
    }

    #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%o', keys);
        let validKeys = true;
        keys.forEach((key) => {
            if (!suchparameterNamen.includes(key)) {
                this.#logger.debug('#checkKeys: Ungültiger Suchparameter "%s"',
                    key,
                );
                validKeys = false;
            }
        });
        return validKeys;
    }
}
