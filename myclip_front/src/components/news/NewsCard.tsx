"use client";

import React from "react";

export type NewsCategory = "UPDATES" | "CONTESTS" | "RULES" | "OTHER";

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  excerpt?: string;
  createdAt: string;
};

function categoryLabel(cat: NewsCategory) {
  switch (cat) {
    case "UPDATES":
      return "Actualizaciones";
    case "CONTESTS":
      return "Concursos";
    case "RULES":
      return "Cambios de normas";
    default:
      return "General";
  }
}

function categoryClass(cat: NewsCategory) {
  switch (cat) {
    case "UPDATES":
      return "bg-blue-100 text-blue-700";
    case "CONTESTS":
      return "bg-purple-100 text-purple-700";
    case "RULES":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type Props = {
  post: NewsPost;
};

export default function NewsCard({ post }: Props) {
  return (
    <a
      href={`/news/${post.slug}`}
      className="block rounded-xl bg-white shadow border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition"
    >
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {new Date(post.createdAt).toLocaleDateString("es-ES")}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${categoryClass(
            post.category
          )}`}
        >
          {categoryLabel(post.category)}
        </span>
      </div>

      <h3 className="mt-2 font-semibold text-gray-900 line-clamp-2">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {post.excerpt}
        </p>
      )}
    </a>
  );
}
