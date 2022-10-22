import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { marked } from "marked";
import invariant from "tiny-invariant";
import type { Post } from "~/models/post.server";

import {
  deletePost,
  getPost,
  updatePost,
  checkForErrors,
} from "~/models/post.server";

type LoaderData = { post: Post; html: string };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  const html = marked(post.markdown);
  return json<LoaderData>({ post, html });
};

enum Actions {
  Delete = "delete",
  Update = "update",
}

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.slug, "Slug must be defined");
  const { slug } = params;
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === Actions.Delete) {
    await deletePost(slug);
  }

  if (action === Actions.Update) {
    const title = formData.get("title");
    const markdown = formData.get("markdown");
    const updatedSlug = formData.get("slug");
    const { errors, hasErrors } = checkForErrors({
      slug: updatedSlug,
      title,
      markdown,
    });

    if (hasErrors) {
      return json(errors);
    }

    invariant(typeof title === "string", "Title must be a string");
    invariant(typeof updatedSlug === "string", "Slug must be a string");
    invariant(typeof markdown === "string", "Markdown must be a string");

    await updatePost(slug, { slug: updatedSlug, title, markdown });
  }

  return redirect("/posts/admin");
};

export default function UpdatePost() {
  const { post } = useLoaderData<LoaderData>();
  const errors = useActionData();
  const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

  return (
    <div>
      <h2 className="text-bold mr-4 inline-block text-xl">{post.slug}</h2>
      <div className="inline-block">
        <Form method="post">
          <input type="hidden" name="action" value={Actions.Delete} />
          <button
            type="submit"
            className="rounded bg-red-500 p-3 text-white hover:scale-125"
          >
            Delete Post
          </button>
        </Form>
      </div>
      <div>
        <Form method="post" className="flex w-full flex-col">
          <label>
            Title:
            <input
              type="text"
              name="title"
              defaultValue={post.title}
              className={inputClassName}
            />
          </label>
          <label>
            Slug:
            <input
              type="text"
              name="slug"
              defaultValue={post.slug}
              className={inputClassName}
            />
          </label>
          <label>
            Markdown:
            <textarea
              name="markdown"
              defaultValue={post.markdown}
              className={inputClassName}
            />
          </label>
          <button type="submit">Update Post</button>
          <input type="hidden" name="action" value={Actions.Update} />
        </Form>
      </div>
    </div>
  );
}
