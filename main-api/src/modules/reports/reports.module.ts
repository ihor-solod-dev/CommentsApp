import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportModel } from './entities/report.model';
import { CommentModel } from '../comments/entities/comment.model';

@Module({
    imports: [SequelizeModule.forFeature([ReportModel, CommentModel])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }