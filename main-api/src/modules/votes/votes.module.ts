import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { VoteModel } from './entities/vote.model';
import { CommentModel } from '../comments/entities/comment.model';

@Module({
    imports: [SequelizeModule.forFeature([VoteModel, CommentModel])],
    controllers: [VotesController],
    providers: [VotesService],
})
export class VotesModule { }