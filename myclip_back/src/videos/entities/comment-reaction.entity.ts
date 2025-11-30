import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "comment_reactions" })
export class CommentReaction {
  @PrimaryGeneratedColumn("uuid")
  reaction_id: string;

  @Column()
  commentId: string;

  @Column()
  userId: string;

  @Column({ type: "int" }) // 1 = like, -1 = dislike
  value: number;
}
