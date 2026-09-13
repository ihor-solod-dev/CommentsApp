import { Injectable } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly usersService: UsersService,
    ) { }

    async getUserStats(userId: number) {
        return this.commentsService.getUserStats(userId);
    }

    async getUsersPage(page: number, pageSize: number) {
        const [users, total] = await Promise.all([
            this.usersService.getAllForStats(page, pageSize),
            this.usersService.countAll(),
        ]);
        return { users, total };
    }
}