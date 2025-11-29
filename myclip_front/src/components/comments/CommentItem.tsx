'use client';

import React from "react";
import { Comment } from "./comments.types";

type Props = {
  comment: Comment;
};

export default function CommentItem({ comment }: Props) {
  return (
    <div className="border-t pt-4">
      <p className="text-gray-800">{comment.content}</p>

      <p className="text-xs text-gray-500 mt-1">
        <strong>{comment.user?.username ?? "Usuario"}</strong> ·{" "}
        {new Date(comment.createdAt).toLocaleString()}
      </p>

      {/* FUTURO:
      <CommentActions commentId={comment.comment_id} />
      <RepliesList replies={comment.replies ?? []} parentId={comment.comment_id} />
      */}
    </div>
  );
}
