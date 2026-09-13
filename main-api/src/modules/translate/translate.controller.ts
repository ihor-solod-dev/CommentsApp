import { Controller, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { IsString, IsISO31661Alpha2, Length } from 'class-validator';

class TranslateDto {
    @IsString()
    @Length(2, 10)
    targetLang!: string;
}

@Controller('translate')
export class TranslateController {
    constructor(private readonly translateService: TranslateService) { }

    @Post(':commentId')
    translate(
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Body() dto: TranslateDto,
    ) {
        return this.translateService.translate(commentId, dto.targetLang);
    }
}