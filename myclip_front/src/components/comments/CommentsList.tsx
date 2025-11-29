import React from "react";
import type { Comment } from "../VideoDetailClient";

type Props = {
  comments: Comment[];
};

export default function CommentsList({ comments }: Props) {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500">Sé el primero en comentar.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.comment_id} className="border-t pt-4">
          <p className="text-gray-800">{c.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            <strong>{c.user?.username ?? "Usuario"}</strong> ·{" "}
            {new Date(c.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
