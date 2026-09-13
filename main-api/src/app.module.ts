import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { GraphQLModule } from './graphql/graphql.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommentsModule } from './modules/comments/comments.module';
import { VotesModule } from './modules/votes/votes.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FilesModule } from './modules/files/files.module';
import { CaptchaModule } from './modules/captcha/captcha.module';
import { TranslateModule } from './modules/translate/translate.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        DatabaseModule,
        RedisModule,
        GraphQLModule,
        AuthModule,
        UsersModule,
        CommentsModule,
        VotesModule,
        ReportsModule,
        FilesModule,
        CaptchaModule,
        TranslateModule,
        NotificationsModule,
        StatsModule,
    ],
})
export class AppModule { }