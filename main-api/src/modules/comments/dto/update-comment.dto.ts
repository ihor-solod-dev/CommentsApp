import { IsString, MaxLength, IsUUID } from 'class-validator';

export class UpdateCommentDto {
    @IsString()
    @MaxLength(10000)
    text!: string;

    @IsUUID()
    captchaId!: string;

    @IsString()
    captchaAnswer!: string;
}