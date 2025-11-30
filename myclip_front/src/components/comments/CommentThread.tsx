"use client";

import React from "react";
import type { Comment } from "./comments.types";

type Props = {
  comment: Comment;
  level?: number;
};

export default function CommentThread({ comment, level = 0 }: Props) {
  return (
    <div className="mt-4" style={{ marginLeft: level * 20 }}>
      {/* Comentario principal o hijo */}
      <div className="p-3 border rounded-lg bg-gray-50">
        <p className="text-gray-800">{comment.content}</p>

        <p className="text-xs text-gray-500 mt-1">
          <strong>{comment.user?.username}</strong> ·{" "}
          {new Date(comment.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Renderizar los hijos */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.children.map((child) => (
            <CommentThread key={child.comment_id} comment={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
