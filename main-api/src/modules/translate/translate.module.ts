import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { CommentsModule } from '../comments/comments.module';

@Module({
    imports: [HttpModule, CommentsModule],
    controllers: [TranslateController],
    providers: [TranslateService],
})
export class TranslateModule { }