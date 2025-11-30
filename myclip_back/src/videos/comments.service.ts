import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentReaction } from "./entities/comment-reaction.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,

    @InjectRepository(CommentReaction)
    private readonly reactionsRepo: Repository<CommentReaction>
  ) {}

  async getCommentsTree(videoId: string) {
    const comments = await this.commentsRepo.find({
      where: { videoId },
      relations: ["user", "children", "children.user"],
      order: { createdAt: "ASC" }
    });

    return comments.filter((c) => !c.parentId);
  }

  async create(videoId: string, userId: string, dto: CreateCommentDto) {
    const comment = this.commentsRepo.create({
      videoId,
      userId,
      content: dto.content,
      parentId: dto.parentId ?? null
    });

    return this.commentsRepo.save(comment);
  }

  async react(commentId: string, userId: string, value: 1 | -1) {
    const comment = await this.commentsRepo.findOne({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException("Comentario no encontrado");

    let reaction = await this.reactionsRepo.findOne({ where: { commentId, userId } });

    if (!reaction) {
      reaction = this.reactionsRepo.create({ commentId, userId, value });
    } else {
      reaction.value = value;
    }

    await this.reactionsRepo.save(reaction);

    const likeCount = await this.reactionsRepo.count({ where: { commentId, value: 1 } });
    const dislikeCount = await this.reactionsRepo.count({ where: { commentId, value: -1 } });

    // 👇 Mejor usar criterio explícito por columna:
    await this.commentsRepo.update(
      { comment_id: commentId },
      { likeCount, dislikeCount },
    );

    return { likeCount, dislikeCount };
  }

}
