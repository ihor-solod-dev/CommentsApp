import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, MaxLength } from 'class-validator';

class CreateReportDto {
    @IsString()
    @MaxLength(1000)
    text!: string;
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post(':commentId')
    create(
        @CurrentUser() user: { id: number },
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Body() dto: CreateReportDto,
    ) {
        return this.reportsService.create(user.id, commentId, dto.text);
    }

    @Get('top')
    @UseGuards(RolesGuard)
    @Roles('admin')
    getTop() {
        return this.reportsService.getTopReported();
    }

    @Get(':commentId/list')
    @UseGuards(RolesGuard)
    @Roles('admin')
    getCommentReports(
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Query('limit', ParseIntPipe) limit = 3,
        @Query('offset', ParseIntPipe) offset = 0,
    ) {
        return this.reportsService.getCommentReports(commentId, limit, offset);
    }

    @Delete(':commentId/dismiss')
    @UseGuards(RolesGuard)
    @Roles('admin')
    dismiss(@Param('commentId', ParseUUIDPipe) commentId: string) {
        return this.reportsService.dismissReports(commentId);
    }
}