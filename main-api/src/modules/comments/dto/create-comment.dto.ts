import { Type } from 'class-transformer';
import {
    IsString,
    IsUUID,
    IsOptional,
    MaxLength,
    IsArray,
    ArrayMaxSize,
    ValidateNested,
} from 'class-validator';

export class CommentFileDto {
    @IsUUID()
    id!: string;

    @IsString()
    filePath!: string;
}

export class CreateCommentDto {
    @IsString()
    @MaxLength(10000)
    text!: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsUUID()
    captchaId!: string;

    @IsString()
    captchaAnswer!: string;

    @IsArray()
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => CommentFileDto)
    @IsOptional()
    files?: CommentFileDto[];
}
