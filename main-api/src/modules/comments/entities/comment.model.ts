import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    BelongsTo,
    PrimaryKey,
    Default,
    AllowNull,
} from 'sequelize-typescript';
import { UserModel } from '../../users/entities/user.model';
import { FileModel } from '../../files/entities/file.model';
import { VoteModel } from '../../votes/entities/vote.model';
import { ReportModel } from '../../reports/entities/report.model';

@Table({ tableName: 'comments', timestamps: false })
export class CommentModel extends Model {
    @PrimaryKey
    @Column(DataType.UUID)
    id!: string;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'date_time', defaultValue: DataType.NOW, })
    dateTime!: Date;

    @AllowNull(false)
    @Column(DataType.TEXT)
    text!: string;

    @Default(0)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    score!: number;

    @Default(0)
    @AllowNull(false)
    @Column(DataType.SMALLINT)
    depth!: number;

    @Default(false)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN, field: 'is_deleted' })
    isDeleted!: boolean;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'created_at', defaultValue: DataType.NOW, })
    createdAt!: Date;

    @Column({ type: DataType.UUID, allowNull: true, field: 'parent_id' })
    parentId!: string | null;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    userId!: number;

    @BelongsTo(() => CommentModel, { foreignKey: 'parent_id', as: 'parent' })
    parent!: CommentModel | null;

    @HasMany(() => CommentModel, { foreignKey: 'parent_id', as: 'children' })
    children!: CommentModel[];

    @BelongsTo(() => UserModel, { foreignKey: 'user_id' })
    user!: UserModel;

    @HasMany(() => FileModel, { foreignKey: 'comment_id' })
    files!: FileModel[];

    @HasMany(() => VoteModel, { foreignKey: 'comment_id' })
    votes!: VoteModel[];

    @HasMany(() => ReportModel, { foreignKey: 'comment_id' })
    reports!: ReportModel[];
}