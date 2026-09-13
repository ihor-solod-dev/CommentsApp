import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(dto);
        this.setRefreshCookie(res, result.refreshToken, result.refreshTtl);
        return { accessToken: result.accessToken, user: result.user };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto);
        this.setRefreshCookie(res, result.refreshToken, result.refreshTtl);
        return { accessToken: result.accessToken, user: result.user };
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @CurrentUser() user: { id: number; jti: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.refresh(user.id, user.jti);
        this.setRefreshCookie(res, result.refreshToken, result.refreshTtl);
        return { accessToken: result.accessToken, user: result.user };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @CurrentUser() user: { jti: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.logout(user.jti);
        this.clearRefreshCookie(res);
    }

    private setRefreshCookie(res: Response, token: string, ttl: number) {
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ttl * 1000,
            path: '/',
        });
    }

    private clearRefreshCookie(res: Response) {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }
}