import { GraphQLClient } from 'graphql-request';
import { getAccessToken } from './axios.instance';

const GRAPHQL_URL = `${import.meta.env.VITE_API_URL}/graphql`;

export function getGraphQLClient(): GraphQLClient {
    return new GraphQLClient(GRAPHQL_URL, {
        headers: () => {
            const token = getAccessToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            return headers;
        },
    });
}