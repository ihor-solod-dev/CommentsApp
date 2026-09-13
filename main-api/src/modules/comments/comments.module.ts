import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { CommentModel } from './entities/comment.model';
import { FileModel } from '../files/entities/file.model';
import { CaptchaModule } from '../captcha/captcha.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        SequelizeModule.forFeature([CommentModel, FileModel]),
        CaptchaModule,
        NotificationsModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService, CommentsResolver],
    exports: [CommentsService],
})
export class CommentsModule { }