import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useTransition } from "@remix-run/react";

import { getPosts } from "~/models/post.server";
import { Actions } from "./admin/$slug";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const transition = useTransition();

  const { posts } = useLoaderData<LoaderData>();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">Blog Admin</h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={post.slug} className="text-blue-600 underline">
                  {post.title}
                </Link>
              </li>
            ))}
            {transition.submission &&
            Object.fromEntries(transition.submission.formData).action !==
              Actions.Update &&
            Object.fromEntries(transition.submission.formData).action !==
              Actions.Delete ? (
              <Link
                to={
                  Object.fromEntries(transition.submission.formData)
                    .slug as string
                }
                className="text-blue-600 underline"
              >
                {
                  Object.fromEntries(transition.submission.formData)
                    .title as string
                }
              </Link>
            ) : null}
          </ul>
        </nav>
        <main className="col-span-4  md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
