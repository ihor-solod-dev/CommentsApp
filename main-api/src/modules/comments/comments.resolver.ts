import {
    Resolver,
    Query,
    Args,
    Int,
    ObjectType,
    Field,
    ID,
    ResolveField,
    Parent,
} from '@nestjs/graphql';
import { CommentsService } from './comments.service';

@ObjectType()
class CommentUser {
    @Field(() => Int)
    id!: number;

    @Field()
    username!: string;

    @Field({ nullable: true })
    avatar!: string;
}

@ObjectType()
class CommentFile {
    @Field(() => ID)
    id!: string;

    @Field()
    filePath!: string;
}

@ObjectType()
class Comment {
    @Field(() => ID)
    id!: string;

    @Field({ nullable: true })
    text!: string;

    @Field()
    isDeleted!: boolean;

    @Field(() => Int)
    score!: number;

    @Field(() => Int)
    depth!: number;

    @Field({ nullable: true })
    parentId!: string;

    @Field()
    dateTime!: Date;

    @Field({ nullable: true })
    user!: CommentUser;

    @Field(() => [CommentFile])
    files!: CommentFile[];

    @Field(() => [Comment])
    children!: Comment[];

    @Field(() => Int)
    totalChildren!: number;
}

@ObjectType()
class ChildrenResult {
    @Field(() => [Comment])
    items!: Comment[];

    @Field(() => Int)
    total!: number;
}

@Resolver(() => Comment)
export class CommentsResolver {
    constructor(private readonly commentsService: CommentsService) { }

    @Query(() => ChildrenResult)
    async commentChildren(
        @Args('parentId', { type: () => ID }) parentId: string,
        @Args('limit', { type: () => Int, defaultValue: 3 }) limit: number,
        @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    ): Promise<ChildrenResult> {
        const [items, total] = await Promise.all([
            this.commentsService.findChildren(parentId, limit, offset),
            this.commentsService.countChildren(parentId),
        ]);

        console.log("items: ", items);
        console.log("\n-------------\n");
        console.log("total: ", total);

        return {
            items: items.map((c) => ({
                ...this.commentsService.serializeComment(c),
                children: [],
                totalChildren: 0,
            })) as any,
            total: total ?? 0,
        };
    }

    @ResolveField(() => Int)
    async totalChildren(@Parent() comment: Comment): Promise<number> {
        return this.commentsService.countChildren(comment.id);
    }
}