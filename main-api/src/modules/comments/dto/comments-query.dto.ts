import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';

export enum SortField {
    SCORE = 'score',
    DATE = 'date_time',
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class CommentsQueryDto {
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @IsEnum(SortField)
    @IsOptional()
    sortField: SortField = SortField.SCORE;

    @IsEnum(SortDirection)
    @IsOptional()
    sortDirection: SortDirection = SortDirection.DESC;
}