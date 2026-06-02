import {
    ID,
    type KrankenhausNeuInput,
    type KrankenhausUpdateInput,
    type SuchparameterInput,
    typeDefs,
} from './types.mts';
import {
    createHandler,
    deleteHandler,
    tokenHandler,
    updateHandler,
} from './mutation-handler.mts';
import { createSchema, createYoga } from 'graphql-yoga';
import { krankenhaeuserHandler, krankenhausHandler } from './query-handler.mts';
import { Hono } from 'hono';
import { getLogger } from '../../logger/logger.mts';
import { rolesRequired } from './roles-required.mts';

const logger = getLogger('query-handler', 'file');
type GraphqlContext = {
    request: Request;
};

const resolvers = {
    Query: {
        krankenhaus: (_: unknown, { id }: { id: ID }) => krankenhausHandler(id),
        krankenhaeuser: (
            _: unknown,
            { input }: { input?: SuchparameterInput },
        ) => krankenhaeuserHandler(input),
    },
    Mutation: {
        create: async (
            _: unknown,
            { input }: { input: KrankenhausNeuInput },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin', 'user');
            return createHandler(input);
        },
        update: async (
            _: unknown,
            { input }: { input: KrankenhausUpdateInput },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin', 'user');
            return updateHandler(input);
        },
        delete: async (
            _: unknown,
            { id }: { id: ID },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin');
            return deleteHandler(id);
        },
        token: (
            _: unknown,
            { username, password }: { username: string; password: string },
        ) => tokenHandler({ username, password }),
    },
};

const yogaServer = createYoga({
    schema: createSchema({ typeDefs, resolvers }),
});

export const app = new Hono();

app.post('/', async (c) => {
    logger.debug('/graphql');
    const { raw } = c.req;
    const { body } = raw;

    const response = await yogaServer.fetch(raw, { body });

    return c.newResponse(response.body, response);
});

export const graphqlApp = app;
