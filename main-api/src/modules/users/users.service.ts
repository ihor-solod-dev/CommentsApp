import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcryptjs from 'bcryptjs';
import { UserModel } from './entities/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(UserModel)
        private readonly userModel: typeof UserModel,
    ) { }

    async findById(id: number) {
        const user = await this.userModel.findOne({
            where: { id },
            attributes: { exclude: ['password'] },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(id: number, dto: UpdateUserDto) {
        const user = await this.userModel.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        if (dto.username !== undefined) user.username = dto.username;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.avatar !== undefined) user.avatar = dto.avatar ?? null;
        if (dto.password !== undefined) {
            user.set('password', await bcryptjs.hash(dto.password, 12));
        }

        await user.save();

        const json = user.toJSON() as Record<string, any>;
        delete json['password'];
        return json;
    }

    async getAllForStats(page: number, pageSize: number) {
        return this.userModel.findAll({
            attributes: ['id', 'username', 'email'],
            offset: (page - 1) * pageSize,
            limit: pageSize,
        });
    }

    async countAll(): Promise<number> {
        return this.userModel.count();
    }
}