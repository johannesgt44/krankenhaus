import {
    type ID,
    type Krankenhaus,
    type SuchparameterInput,
    toKrankenhausType,
    toSuchparameter,
} from './types.mts';
import {
    type KrankenhausMitAdresse,
    type KrankenhausMitAdresseUndFachbereiche,
} from '../service/krankenhaus-service.mts';
import { GraphQLError } from 'graphql';
import { NotFoundError } from '../service/errors.mts';
import { type Slice } from '../service/slice.mts';
import { container } from '../../container.mts';
import { createPageable } from '../service/pageable.mts';
import { getLogger } from '../../logger/logger.mts';

const logger = getLogger('query-handler', 'file');

export const krankenhausHandler = async (id: ID) => {
    logger.debug('krankenhausHandler: id=%s', id);

    let krankenhaus: Krankenhaus;
    try {
        const krankenhausDB: KrankenhausMitAdresseUndFachbereiche =
            await container.krankenhausService.findById({
                id: Number.parseInt(id, 10),
            });
        krankenhaus = toKrankenhausType(krankenhausDB);
    } catch (err) {
        if (err instanceof NotFoundError) {
            logger.debug('krankenhausHandler: Kein Krankenhaus gefunden.');
            throw new GraphQLError(err.message, {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        const { message } = err as Error;
        throw new GraphQLError(message, {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }

    logger.debug('krankenhausHandler: result=%o', krankenhaus);
    return krankenhaus;
};

export const krankenhaeuserHandler = async (
    input?: SuchparameterInput | undefined,
) => {
    logger.debug('krankenhaeuserHandler: input=%o', input ?? 'undefined');
    const pageable = createPageable({});
    const suchparameter = toSuchparameter(input);

    let krankenhaeuserSlice: Readonly<Slice<Readonly<KrankenhausMitAdresse>>>;
    try {
        krankenhaeuserSlice = await container.krankenhausService.find(
            suchparameter,
            pageable,
        );
    } catch (err) {
        if (err instanceof NotFoundError) {
            logger.debug('Keine Krankenhaeuser gefunden.');
            throw new GraphQLError(err.message, {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        const { message } = err as Error;
        throw new GraphQLError(message, {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
    logger.debug(
        'krankenhaeuserHandler: krankenhaeuserSlice=%o',
        krankenhaeuserSlice,
    );

    const result = krankenhaeuserSlice.content.map((krankenhaus) =>
        toKrankenhausType(krankenhaus),
    );
    logger.debug('krankenhaeuserHandler: result=%o', result);
    return result;
};
