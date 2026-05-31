/**
 * Das Modul `where-builder` besteht aus der Klasse {@linkcode WhereBuilder}.
 * @packageDocumentation
 */

import { type KrankenhausWhereInput } from '../../../generated/prisma/models/Krankenhaus.ts';
import { type Suchparameter } from './suchparameter.mts';
import { getLogger } from '../../logger/logger.mts';

// Typdefinition für die Suche mit der Krankenhaus-Id
export type BuildIdParams = {
    readonly id: number;
    readonly mitFachbereiche?: boolean;
};

const logger = getLogger('buildWhere', 'func');

/**
 * WHERE-Klausel für die Suche nach Krankenhäusern aufbauen.
 * @param suchparameter JSON-Objekt mit den Suchparametern
 * @returns KrankenhausWhereInput
 */
export const buildWhere = ({ ...restProps }: Suchparameter) => {
    logger.debug('build: restProps=%o', restProps);

    const where: KrankenhausWhereInput = {};

    Object.entries(restProps).forEach(([key, value]) => {
        switch (key) {
            case 'name':
                where.name = { equals: value as string };
                break;
            case 'mitarbeiteranzahl': {
                const mitarbeiteranzahlNummer = Number.parseInt(
                    value as string,
                    10,
                );
                if (!Number.isNaN(mitarbeiteranzahlNummer)) {
                    where.mitarbeiteranzahl = { lte: mitarbeiteranzahlNummer };
                }
                break;
            }
            case 'bettenanzahl': {
                const bettenanzahlNummer = Number.parseInt(value as string, 10);
                if (!Number.isNaN(bettenanzahlNummer)) {
                    where.bettenanzahl = { gte: bettenanzahlNummer };
                }
                break;
            }
            case 'ort':
                where.adresse = {
                    ort: { contains: value as string, mode: 'insensitive' },
                };
                break;
            default:
                break;
        }
    });

    logger.debug('build: where=%o', where);
    return where;
};
