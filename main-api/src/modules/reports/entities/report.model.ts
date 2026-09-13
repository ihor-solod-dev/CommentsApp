import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
} from 'sequelize-typescript';
import { UserModel } from '../../users/entities/user.model';
import { CommentModel } from '../../comments/entities/comment.model';

@Table({ tableName: 'reports', timestamps: false })
export class ReportModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    text!: string;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'created_at', defaultValue: DataType.NOW, })
    createdAt!: Date;

    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'comment_id' })
    commentId!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    userId!: number;

    @BelongsTo(() => CommentModel, { foreignKey: 'comment_id' })
    comment!: CommentModel;

    @BelongsTo(() => UserModel, { foreignKey: 'user_id' })
    user!: UserModel;
}