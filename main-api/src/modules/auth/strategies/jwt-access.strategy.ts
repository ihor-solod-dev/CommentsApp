import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtAccessPayload {
    sub: number;
    role: string;
    jti: string;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_ACCESS_PUBLIC_KEY'),
            algorithms: ['RS256'],
        });
    }

    async validate(payload: JwtAccessPayload) {
        if (!payload.sub || !payload.role) {
            throw new UnauthorizedException();
        }
        return { id: payload.sub, role: payload.role, jti: payload.jti };
    }
}