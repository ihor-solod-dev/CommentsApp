import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';

@Module({
    imports: [
        NestGraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
            sortSchema: true,
            playground: process.env.NODE_ENV === 'development',
            context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
        }),
    ],
})
export class GraphQLModule { }