import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsQueryDto } from './dto/comments-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get()
    findAll(@Query() query: CommentsQueryDto) {
        return this.commentsService.findRootComments(query);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    findMy(
        @CurrentUser() user: { id: number },
        @Query() query: CommentsQueryDto,
    ) {
        return this.commentsService.findUserComments(user.id, query);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: { id: number },
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentsService.create(user.id, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: { id: number },
        @Body() dto: UpdateCommentDto,
    ) {
        return this.commentsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: { id: number; role: string },
    ) {
        return this.commentsService.softDelete(id, user.id, user.role);
    }
}