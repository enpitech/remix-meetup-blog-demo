import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  type ActionFunction,
  json,
  redirect,
  type LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  getPost,
  updatePost,
  deletePost,
  checkForErrors,
} from "~/models/post.server";
import type { PostLoaderData } from "../$slug";

enum Actions {
  Delete = "delete",
  Update = "update",
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json<Pick<PostLoaderData, "post">>({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  // TODO: remove this fake delay
  await new Promise((res) => setTimeout(res, 1000));

  invariant(params.slug, "params.slug must be defined");
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

export default function EditPost() {
  const { post } = useLoaderData<PostLoaderData>();
  const errors = useActionData();
  const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

  return (
    <div>
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
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            Update Post
          </button>
          <input type="hidden" name="action" value={Actions.Update} />
        </Form>
      </div>
    </div>
  );
}
