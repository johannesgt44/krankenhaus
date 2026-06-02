import {
    ACCEPT,
    APPLICATION_JSON,
    CONTENT_TYPE,
    GRAPHQL_RESPONSE_JSON,
    POST,
    graphqlURL,
} from '../constants.mts';
import { type GraphQLQuery } from './graphql.mts';

export const getToken = async (
    username: string,
    password: string,
): Promise<string> => {
    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);

    const query: GraphQLQuery = {
        query: `
            mutation {
                token(
                    username: "${username}",
                    password: "${password}"
                ) {
                    access_token
                }
            }
        `,
    };

    const response = await fetch(graphqlURL, {
        method: POST,
        body: JSON.stringify(query),
        headers,
    });

    const body = (await response.json()) as {
        data: { token: { access_token: string } };
    };
    const { access_token } = body.data.token;
    if (typeof access_token !== 'string') {
        throw new Error('Der Token fuer GraphQL ist kein String');
    }
    return access_token;
};
