import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../users/entities/user.model';
import { RefreshTokenModel } from './entities/refresh-token.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { error } from 'console';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(UserModel)
        private readonly userModel: typeof UserModel,
        @InjectModel(RefreshTokenModel)
        private readonly refreshTokenModel: typeof RefreshTokenModel,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({
            where: {
                [Op.or]: [{ email: dto.email }, { username: dto.username }],
            },
        });
        if (existing) {
            throw new ConflictException('User with this email or username already exists');
        }

        const hashed = await bcryptjs.hash(dto.password, 12);
        const user = await this.userModel.create({
            username: dto.username,
            email: dto.email,
            password: hashed,
        } as any);

        return this.issueTokens(user);
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({
            where: { email: dto.email },
            attributes: ['id', 'email', 'password', 'role', 'username', 'avatar'],
        });

        if (!user || !(await bcryptjs.compare(dto.password, user.password))) {

            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueTokens(user);
    }

    async refresh(userId: number, jti: string) {
        const record = await this.refreshTokenModel.findOne({ where: { jti } });

        if (!record || record.userId !== userId || new Date() > record.expiresAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.refreshTokenModel.destroy({ where: { jti } });

        const user = await this.userModel.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('Invalid refresh token');

        return this.issueTokens(user);
    }

    async logout(jti: string) {
        await this.refreshTokenModel.destroy({ where: { jti } });
    }

    private async issueTokens(user: UserModel) {
        const jti = uuidv4();
        const accessPayload = { sub: user.id, role: user.role, jti };
        const refreshPayload = { sub: user.id, jti };


        const privateKey = this.config
            .get<string>('JWT_ACCESS_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n');

        const accessToken = this.jwtService.sign(accessPayload, {
            privateKey,
            algorithm: 'RS256',
            expiresIn: Number(this.config.get('JWT_ACCESS_TTL') ?? 86400),
        });

        const refreshTtl = this.config.get<number>('JWT_REFRESH_TTL', 604800);
        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: refreshTtl,
        });

        const expiresAt = new Date(Date.now() + refreshTtl * 1000);
        await this.refreshTokenModel.create({ jti, userId: user.id, expiresAt } as any);

        return {
            accessToken,
            refreshToken,
            refreshTtl,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        };
    }
}