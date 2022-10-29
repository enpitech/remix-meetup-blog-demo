import type { ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createPost } from "~/models/post.server";
import invariant from "tiny-invariant";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type ActionData =
  | { title: null | string; slug: null | string; markdown: null | string }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  // TODO: remove this fake delay
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "Title must be a string");
  invariant(typeof slug === "string", "Slug must be a string");
  invariant(typeof markdown === "string", "Markdown must be a string");
  try {
    // randomly throwing an error to simulate optimistic UI revert
    if (Math.random() > 0.01) {
      throw new Error("Post creation error");
    }
    await createPost({ title, slug, markdown });
  } catch (e) {
    // this part is to revert the optimistic UI
    // Its actually not really matter what the returned object here
    // Remix will just rerender the correct state from the server thus
    // 'reverting' to the old state before creating the post
    // In case we want to alert the user about the error we can use this object
    return json(
      { create: "Sorry, we couldn't create the post" },
      {
        status: 500,
      }
    );
  }
  return {};
  // return redirect("/posts/admin");
};

export default function NewPost() {
  const errors = useActionData();

  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <>
      {isCreating ? (
        <p>
          <Link to="new" className="text-blue-600 underline">
            Create a New Post
          </Link>
        </p>
      ) : (
        ""
      )}
      <Form method="post" style={{ display: !isCreating ? "block" : "none" }}>
        {errors ? <p className="text-red-600">{errors.create}</p> : null}
        <p>
          <label>
            Post Title:{" "}
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
            <input type="text" name="title" className={inputClassName} />
          </label>
        </p>
        <p>
          <label>
            Post Slug:{" "}
            {errors?.slug ? (
              <em className="text-red-600">{errors.slug}</em>
            ) : null}
            <input type="text" name="slug" className={inputClassName} />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">
            Markdown:
            {errors?.markdown ? (
              <em className="text-red-600">{errors.markdown}</em>
            ) : null}
          </label>
          <br />
          <textarea
            id="markdown"
            rows={20}
            name="markdown"
            className={`${inputClassName} font-mono`}
          />
        </p>
        <p className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            Create Post
          </button>
        </p>
      </Form>
    </>
  );

  return isCreating ? (
    <p>
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
    </p>
  ) : (
    <Form method="post">
      {errors ? <p className="text-red-600">{errors.create}</p> : null}
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input type="text" name="slug" className={inputClassName} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          Create Post
        </button>
      </p>
    </Form>
  );
}
