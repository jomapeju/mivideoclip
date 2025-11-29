export interface CommentUser {
  user_id: string;
  username: string;
}

export interface Comment {
  comment_id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user?: CommentUser;
  replies?: Comment[];
}
