import { prisma } from "~/db.server";
import type { Post } from "@prisma/client";
export type { Post };

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.create({ data: post });
}

export async function updatePost(
  slug: string,
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.update({
    where: { slug },
    data: post,
  });
}

export async function deletePost(slug: string) {
  return prisma.post.delete({ where: { slug } });
}

export function checkForErrors({ slug, title, markdown }: any) {
  const errors = {
    slug: slug ? null : "Slug is required",
    title: title ? null : "Title is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  return { hasErrors, errors };
}
