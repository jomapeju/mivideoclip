"use client";

import React from "react";
import type { Comment } from "./comments.types";
import CommentThread from "./CommentThread";

type Props = {
  comments: Comment[];
};

export default function CommentsList({ comments }: Props) {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500">Sé el primero en comentar.</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentThread key={comment.comment_id} comment={comment} />
      ))}
    </div>
  );
}
