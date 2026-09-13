import { Controller, Post, Body, UseGuards, ParseUUIDPipe, Param, Get } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsEnum } from 'class-validator';
import { VoteType } from './entities/vote.model';

class VoteDto {
    @IsEnum(VoteType)
    voteType!: VoteType;
}

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
    constructor(private readonly votesService: VotesService) { }

    @Post(':commentId')
    vote(
        @CurrentUser() user: { id: number },
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Body() dto: VoteDto,
    ) {
        return this.votesService.vote(user.id, commentId, dto.voteType);
    }

    @Get('my')
    getMyVotes(@CurrentUser() user: { id: number }) {
        return this.votesService.getUserVotes(user.id);
    }
}