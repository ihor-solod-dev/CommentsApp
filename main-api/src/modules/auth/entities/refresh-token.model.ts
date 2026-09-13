import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    AllowNull,
    BelongsTo,
} from 'sequelize-typescript';
import { UserModel } from '../../users/entities/user.model';

@Table({ tableName: 'refresh_tokens', timestamps: false })
export class RefreshTokenModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(255))
    jti!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    userId!: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'expires_at' })
    expiresAt!: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'created_at', defaultValue: DataType.NOW, })
    createdAt!: Date;

    @BelongsTo(() => UserModel, { foreignKey: 'user_id' })
    user!: UserModel;
}