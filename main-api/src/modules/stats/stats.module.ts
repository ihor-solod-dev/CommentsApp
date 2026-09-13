import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { StatsController } from './stats.controller';

@Module({
    imports: [CommentsModule, UsersModule],
    providers: [StatsService],
    controllers: [StatsController],
    exports: [StatsService],
})
export class StatsModule { }