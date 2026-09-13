import { Table, Column, Model, DataType, BelongsTo, PrimaryKey, AllowNull } from 'sequelize-typescript';
import { CommentModel } from '../../comments/entities/comment.model';

@Table({ tableName: 'files', timestamps: false })
export class FileModel extends Model {
    @PrimaryKey
    @Column(DataType.UUID)
    id!: string;

    @AllowNull(false)
    @Column({ type: DataType.TEXT, field: 'file_path' })
    filePath!: string;

    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'comment_id' })
    commentId!: string;

    @BelongsTo(() => CommentModel, { foreignKey: 'comment_id' })
    comment!: CommentModel;
}