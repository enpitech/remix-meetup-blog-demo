import { Form, useLoaderData, useTransition } from "@remix-run/react";

import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";

import invariant from "tiny-invariant";
import { deletePost, getPost, Post, updatePost } from "~/models/post.server";

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "Slug must be defined");

  const post = await getPost(params.slug);

  return json(post);
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.slug, "Slug must be defined");

  // TODO: remove this fake delay
  await new Promise((res) => setTimeout(res, 3000));

  switch (request.method) {
    case "DELETE": {
      await deletePost(params.slug);
      return redirect("/posts/admin");
    }
    case "PUT": {
      const formData = await request.formData();

      const post = Object.fromEntries(formData);

      await updatePost(
        params.slug,
        post as Pick<Post, "slug" | "title" | "markdown">
      );

      return redirect(`/posts/${post.slug}`);
    }
  }
  return {};
};

export default function PostSlug() {
  const post = useLoaderData<Post>();
  const transition = useTransition();
  const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;
  const isSubmitting = transition.state === "submitting";
  const isDeleting = isSubmitting && transition.submission?.method === "DELETE";

  return (
    <div>
      <h1>{post.title}</h1>

      <Form method="delete">
        <button className="bg-red-500 p-3 text-white">
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </Form>

      <Form method="put">
        <p>
          <label>
            Post Title:{" "}
            <input
              type="text"
              name="title"
              className={inputClassName}
              defaultValue={post.title}
            />
          </label>
        </p>
        <p>
          <label>
            Post Slug:{" "}
            <input
              type="text"
              name="slug"
              className={inputClassName}
              defaultValue={post.slug}
            />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">Markdown:</label>
          <br />
          <textarea
            id="markdown"
            rows={4}
            name="markdown"
            defaultValue={post.markdown}
            className={`${inputClassName} font-mono`}
          />
        </p>
        <p className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            {isSubmitting && !isDeleting ? "Updating...." : "Update"}
          </button>
        </p>
      </Form>
    </div>
  );
}
