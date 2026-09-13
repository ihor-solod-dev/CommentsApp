import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { generateUuidV7 } from '../../shared/utils/uuid-v7.util';
import { IsString, IsIn } from 'class-validator';

class RequestUploadDto {
    @IsString()
    @IsIn(['image/jpeg', 'image/gif', 'image/png', 'text/plain'])
    mimeType!: string;
}

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    @Post('presign')
    async presign(
        @CurrentUser() user: { id: number },
        @Body() dto: RequestUploadDto,
    ) {
        const fileId = generateUuidV7();
        const token = this.jwtService.sign(
            { fileId, userId: user.id, mimeType: dto.mimeType },
            {
                secret: this.configService.get<string>('FILES_SERVICE_SECRET'),
                expiresIn: 300,
            },
        );

        const filesUrl = this.configService.get<string>('FILES_SERVICE_URL');
        return {
            fileId,
            uploadUrl: `${filesUrl}/upload`,
            token,
        };
    }
}