import {
    type CreatePayload,
    type DeletePayload,
    type ID,
    type KrankenhausNeuInput,
    type KrankenhausUpdateInput,
    type UpdatePayload,
    toCreate,
    toID,
    toInt,
    toNumber,
    toUpdate,
} from './types.mts';
import {
    KrankenhausNeuSchema,
    KrankenhausUpdateGraphQLSchema,
} from '../router/krankenhaus-validation.mts';
import { GraphQLError } from 'graphql';
import { NotFoundError } from '../service/errors.mts';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';

const logger = getLogger('mutation-handler', 'file');
const { krankenhausWriteService, keycloakService } = container;

// -----------------------------------------------------------------------------
// Neuanlegen
// -----------------------------------------------------------------------------

const validateKrankenhausNeu = (krankenhaus: KrankenhausNeuInput) => {
    try {
        KrankenhausNeuSchema.parse(krankenhaus);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;
            if (err.name === 'ZodError') {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            } else {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                });
            }
        } else {
            throw new GraphQLError('Unbekannter Fehler', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }
    }

    logger.debug('validateKrankenhausNeu: ok');
};

export const createHandler = async (
    input: KrankenhausNeuInput,
): Promise<CreatePayload> => {
    logger.debug('createHandler: input=%o', input);

    validateKrankenhausNeu(input);

    const krankenhausCreate = toCreate(input);
    logger.debug('createHandler: krankenhausCreate=%o', krankenhausCreate);
    const id = await krankenhausWriteService.create(krankenhausCreate);

    logger.debug('createHandler: id=%d', id);
    return { id: toID(id) };
};

// -----------------------------------------------------------------------------
// Aendern
// -----------------------------------------------------------------------------

const validateKrankenhausUpdate = (krankenhaus: KrankenhausUpdateInput) => {
    try {
        KrankenhausUpdateGraphQLSchema.parse(krankenhaus);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;
            if (err.name === 'ZodError') {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            } else {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                });
            }
        } else {
            throw new GraphQLError('Unbekannter Fehler', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }
    }

    logger.debug('validateKrankenhausUpdate: ok');
};

export const updateHandler = async (
    input: KrankenhausUpdateInput,
): Promise<UpdatePayload> => {
    logger.debug('updateHandler: input=%o', input);

    validateKrankenhausUpdate(input);

    const krankenhausUpdate = toUpdate(input);
    logger.debug('updateHandler: krankenhausUpdate=%o', krankenhausUpdate);

    let version: number | undefined;
    try {
        version = await krankenhausWriteService.update({
            id: toNumber(input.id),
            krankenhaus: krankenhausUpdate,
            version: `"${input.version}"`,
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            logger.debug('krankenhausHandler: Kein Krankenhaus gefunden.');
            throw new GraphQLError(err.message, {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
    }

    logger.debug('updateHandler: version=%s', version);
    return { version: toInt(version ?? 0) };
};

// -----------------------------------------------------------------------------
// Loeschen
// -----------------------------------------------------------------------------
export const deleteHandler = async (id: ID) => {
    logger.debug('deleteHandler: id=%s', id);
    const success = await krankenhausWriteService.delete(toNumber(id));
    const payload: DeletePayload = { success };
    return payload;
};

// -----------------------------------------------------------------------------
// Security
// -----------------------------------------------------------------------------
export const tokenHandler = async ({
    username,
    password,
}: {
    username: string;
    password: string;
}) => {
    logger.debug('tokenHandler: username=%s', username);
    const token = await keycloakService.token({ username, password });
    if (token === undefined) {
        throw new GraphQLError('Fehler bei username und/oder Passwort', {
            extensions: {
                code: 'BAD_USER_INPUT',
            },
        });
    }
    logger.debug('tokenHandler: token=%o', token);
    return token;
};
