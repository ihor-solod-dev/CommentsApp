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

export enum VoteType {
    LIKE = 'like',
    DISLIKE = 'dislike',
}

@Table({ tableName: 'votes', timestamps: false })
export class VoteModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'date_time', defaultValue: DataType.NOW, })
    dateTime!: Date;

    @AllowNull(false)
    @Column({ type: DataType.ENUM(...Object.values(VoteType)), field: 'vote_type' })
    voteType!: VoteType;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    userId!: number;

    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'comment_id' })
    commentId!: string;

    @BelongsTo(() => UserModel, { foreignKey: 'user_id' })
    user!: UserModel;

    @BelongsTo(() => CommentModel, { foreignKey: 'comment_id' })
    comment!: CommentModel;
}