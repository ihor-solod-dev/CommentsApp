import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { UserModel } from '../modules/users/entities/user.model';
import { CommentModel } from '../modules/comments/entities/comment.model';
import { FileModel } from '../modules/files/entities/file.model';
import { VoteModel } from '../modules/votes/entities/vote.model';
import { ReportModel } from '../modules/reports/entities/report.model';
import { RefreshTokenModel } from '../modules/auth/entities/refresh-token.model';

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const url = new URL(config.getOrThrow<string>('DATABASE_URL'));
                return {
                    dialect: 'postgres' as const,
                    host: url.hostname,
                    port: Number(url.port) || 5432,
                    username: decodeURIComponent(url.username),
                    password: decodeURIComponent(url.password),
                    database: url.pathname.replace(/^\//, ''),
                    models: [UserModel, CommentModel, FileModel, VoteModel, ReportModel, RefreshTokenModel],
                    synchronize: false,
                    logging: config.get('NODE_ENV') === 'development' ? console.log : false,
                    pool: {
                        max: 20,
                        idle: 30000,
                        acquire: 2000,
                    },
                };
            },
        }),
    ],
})
export class DatabaseModule { }