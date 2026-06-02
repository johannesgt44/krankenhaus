import { type GraphQLParams } from 'graphql-yoga';

export type GraphQLQuery = Pick<GraphQLParams, 'query'>;
