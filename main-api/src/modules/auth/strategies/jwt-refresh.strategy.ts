import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.['refresh_token'] ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: { sub: number; jti: string }) {
        const token = req?.cookies?.['refresh_token'];
        if (!token || !payload.sub) throw new UnauthorizedException();
        return { id: payload.sub, jti: payload.jti, token };
    }
}