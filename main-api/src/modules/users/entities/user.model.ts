import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    PrimaryKey,
    AutoIncrement,
    Unique,
    Default,
    AllowNull,
} from 'sequelize-typescript';
import { CommentModel } from '../../comments/entities/comment.model';
import { VoteModel } from '../../votes/entities/vote.model';
import { ReportModel } from '../../reports/entities/report.model';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Table({ tableName: 'users', timestamps: false })
export class UserModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(50))
    username!: string;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(255))
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    password!: string;

    @Default(UserRole.USER)
    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(UserRole)))
    role!: UserRole;

    @Column({ type: DataType.STRING(512), allowNull: true })
    avatar!: string | null;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'created_at', defaultValue: DataType.NOW, })
    createdAt!: Date;

    @HasMany(() => CommentModel, { foreignKey: 'user_id' })
    comments!: CommentModel[];

    @HasMany(() => VoteModel, { foreignKey: 'user_id' })
    votes!: VoteModel[];

    @HasMany(() => ReportModel, { foreignKey: 'user_id' })
    reports!: ReportModel[];
}