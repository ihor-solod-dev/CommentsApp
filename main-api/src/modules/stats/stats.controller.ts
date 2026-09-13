import { Controller, Get, Query, Headers, UnauthorizedException, ParseIntPipe, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ConfigService } from '@nestjs/config';

@Controller('internal/stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService,
        private readonly configService: ConfigService,
    ) { }

    @Get('users')
    getUsers(
        @Headers('x-internal-secret') secret: string,
        @Query('page', ParseIntPipe) page = 1,
        @Query('pageSize', ParseIntPipe) pageSize = 100,
    ) {
        if (secret !== this.configService.get('MAIN_API_INTERNAL_SECRET')) {
            throw new UnauthorizedException();
        }
        return this.statsService.getUsersPage(page, pageSize);
    }

    @Get('user/:userId')
    getUserStats(
        @Headers('x-internal-secret') secret: string,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        if (secret !== this.configService.get('MAIN_API_INTERNAL_SECRET')) {
            throw new UnauthorizedException();
        }
        return this.statsService.getUserStats(userId);
    }
}