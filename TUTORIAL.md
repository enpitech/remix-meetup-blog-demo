# Blog tutorial instructions

## Remix Stacks

- branch `stage-0-clean-project`
  1. Start by cloning the repo
  2. checkout the stage-0 branch
  3. create your own `.env` file by rename `.env.example` - optional: change the secret
  4. run:
  - `npm install`
  - `npm run setup`
  - `npm run dev`
    You're ready to go 💪

## First Route

- branch `stage-1-first-route`

### 💿 Add a link to posts in app/routes/index.tsx

```
<div className="mx-auto mt-16 max-w-7xl text-center">

  <Link
    to="/posts"
    className="text-xl text-blue-600 underline"
  >
    Blog Posts
  </Link>
</div>
```

### 💿 Create a new file in app/routes/posts/index.tsx

- Create the Posts component

```
export default function Posts() {
   return ( <main>
      <h1>Posts</h1>
    </main> );
   }
```

- Click on the link 🎉

## Loading Data

- branch `stage-2-loading-data`

### 💿 Make the posts route "loader"

add this code to `app/routes/posts/index.tsx/`

```
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({
    posts: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};

export default function Posts() {
  const { posts } = useLoaderData();
  console.log(posts);
  return (
    <main>
      <h1>Posts</h1>
    </main>
  );
}
```

### 💿 Render links to our posts

```
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

// ...
export default function Posts() {
  const { posts } = useLoaderData();
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={post.slug}
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### 💿 Add the Post type and generic for useLoaderData

```
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

type Post = {
  slug: string;
  title: string;
};

type LoaderData = {
  posts: Array<Post>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};

export default function Posts() {
  const { posts } = useLoaderData() as LoaderData;
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={post.slug}
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## A little Refactoring

- branch `stage-3-a-little-refactoring`

- Separation of concern: our model should handle data operations

### 💿 Create app/models/post.server.ts

```
type Post = {
  slug: string;
  title: string;
};

export async function getPosts(): Promise<Array<Post>> {
  return [
    {
      slug: "my-first-post",
      title: "My First Post",
    },
    {
      slug: "90s-mixtape",
      title: "A Mixtape I Made Just For You",
    },
  ];
}

```

### 💿 Update the posts route to use our new posts module:

```
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

type LoaderData = {
  // this is a handy way to say: "posts is whatever type getPosts resolves to"
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: await getPosts(),
  });
};

// ...
```

## Pulling From a Data Source

- branch `stage-4-pulling-from-a-data-source`

### 💿 First, we need to update our Prisma schema

`prisma/schema.prisma`

```
// Stick this at the bottom of that file:

model Post {
  slug     String @id
  title    String
  markdown String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 💿 Now let's tell Prisma to update our local database and TypeScript definitions to match this schema change:

`npx prisma db push`

### 💿 Let's seed our database with a couple posts. Open prisma/seed.ts and add this to the end of the seed functionality (right before the console.log):

`prisma/seed.js`

```
const posts = [
  {
    slug: "my-first-post",
    title: "My First Post",
    markdown: `
# This is my first post

Isn't it great?
    `.trim(),
  },
  {
    slug: "90s-mixtape",
    title: "A Mixtape I Made Just For You",
    markdown: `
# 90s Mixtape

- I wish (Skee-Lo)
- This Is How We Do It (Montell Jordan)
- Everlong (Foo Fighters)
- Ms. Jackson (Outkast)
- Interstate Love Song (Stone Temple Pilots)
- Killing Me Softly With His Song (Fugees, Ms. Lauryn Hill)
- Just a Friend (Biz Markie)
- The Man Who Sold The World (Nirvana)
- Semi-Charmed Life (Third Eye Blind)
- ...Baby One More Time (Britney Spears)
- Better Man (Pearl Jam)
- It's All Coming Back to Me Now (Céline Dion)
- This Kiss (Faith Hill)
- Fly Away (Lenny Kravits)
- Scar Tissue (Red Hot Chili Peppers)
- Santa Monica (Everclear)
- C'mon N' Ride it (Quad City DJ's)
    `.trim(),
  },
];

for (const post of posts) {
  await prisma.post.upsert({
    where: { slug: post.slug },
    update: post,
    create: post,
  });
}
```

### Great, let's get those posts into the database with the seed script:

`npx prisma db seed`

### 💿 Let's generate a migration file for our schema changes - which will be required if you deploy your application rather than just running in dev mode locally.

`npx prisma migrate dev`

### 💿 Now update the app/models/post.server.ts file to read from the SQLite database:

`app/models/post.server.ts`

```
import { prisma } from "~/db.server";

export async function getPosts() {
  return prisma.post.findMany();
}
```

### 💿 Now that the Prisma client has been updated, we will need to restart our server. So stop the dev server and start it back up again with npm run dev.

## Dynamic Route Params

- branch `stage-5-dynamic-route-params`

- Now let's make a route to actually view the post. We want these URLs to work:
  ```
  /posts/my-first-post
  /posts/90s-mixtape
  ```

### 💿 Create a dynamic route at "app/routes/posts/$slug.tsx"

`app/routes/posts/\$slug.tsx`

```
export default function PostSlug() {
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Some Post
      </h1>
    </main>
  );
}
```

### 💿 Add a loader to access the params

```
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }) => {
  return json({ slug: params.slug });
};

export default function PostSlug() {
  const { slug } = useLoaderData();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Some Post: {slug}
      </h1>
    </main>
  );
}
```

### 💿 Let's get some help from TypeScript for the loader function signature.

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({
  params,
}) => {
  return json({ slug: params.slug });
};
```

### 💿 Add a getPost function to our post module

- Update the `app/models/post.server.ts` file:

```
import { prisma } from "~/db.server";

export type { Post } from "@prisma/client";

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}
```

- If you see a TypeScript warning, such as TS2305: Module '"@prisma/client"' has no exported member 'Post'., you may need to restart your editor.

### 💿 Use the new getPost function in the route

`app/routes/posts/$slug.tsx`

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getPost } from "~/models/post.server";

export const loader: LoaderFunction = async ({
  params,
}) => {
  const post = await getPost(params.slug);
  return json({ post });
};

export default function PostSlug() {
  const { post } = useLoaderData();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
    </main>
  );
}
```

### 💿 Let's make TypeScript happy with our code:

`app/routes/posts/$slug.tsx`

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Post } from "~/models/post.server";
import { getPost } from "~/models/post.server";

type LoaderData = { post: Post };

export const loader: LoaderFunction = async ({
  params,
}) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

export default function PostSlug() {
  const { post } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
    </main>
  );
}
```

### 💿 Parse the markdown into HTML

```
npm add marked
# if using typescript
npm add @types/marked -D
```

- restart our server
  `app/routes/posts/$slug.tsx`

```
import { marked } from "marked";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Post } from "~/models/post.server";
import { getPost } from "~/models/post.server";

type LoaderData = { post: Post; html: string };

export const loader: LoaderFunction = async ({
  params,
}) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  const html = marked(post.markdown);
  return json<LoaderData>({ post, html });
};

export default function PostSlug() {
  const { post, html } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        {post.title}
      </h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

## Nested Routing

- branch `stage-6-nested-routing`

### 💿 First, let's add a link to the admin section on the posts index route:

`/app/routes/posts/index.tsx`

```
// ...
<Link to="admin" className="text-red-600 underline">
  Admin
</Link>
// ...
```

### 💿 Create an admin route within the posts directory:

`app/routes/posts/admin.tsx`

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData() as LoaderData;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={post.slug}
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          ...
        </main>
      </div>
    </div>
  );
}
```

- ## Index Routes

### 💿 Create a folder for admin.tsx's child routes, with an index inside

`app/routes/posts/admin/index.tsx`

```
import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <p>
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
    </p>
  );
}
```

### 💿 Add an outlet to the admin page

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  return json({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData() as LoaderData;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={post.slug}
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 💿 Create the app/routes/posts/admin/new.tsx route

`app/routes/posts/admin/new.tsx`

```
export default function NewPost() {
  return <h2>New Post</h2>;
}
```

## Actions

- branch `stage-7-actions`

### 💿 Add a form to the new route

`app/routes/posts/admin/new.tsx`

```
import { Form } from "@remix-run/react";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          <input
            type="text"
            name="title"
            className={inputClassName}
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
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
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
```

### 💿 Add createPost anywhere inside of app/models/post.server.ts

`app/models/post.server.ts`

```
// ...
export async function createPost(post) {
  return prisma.post.create({ data: post });
}
```

### 💿 Call createPost from the new post route's action

```
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createPost } from "~/models/post.server";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};

// ...
```

### 💿 Add the types to both files we changed

`app/models/post.server.ts`

```
// ...
import type { Post } from "@prisma/client";
export type { Post };

// ...

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.create({ data: post });
}
```

`app/routes/posts/admin/new.tsx`

```

import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createPost } from "~/models/post.server";

export const action: ActionFunction = async ({
request,
}) => {
const formData = await request.formData();

const title = formData.get("title");
const slug = formData.get("slug");
const markdown = formData.get("markdown");

await createPost({ title, slug, markdown });

return redirect("/posts/admin");
};

// ...

```

### 💿 Validate if the form data contains what we need, and return the errors if not

`app/routes/posts/admin/new.tsx`

```
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createPost } from "~/models/post.server";

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;
export const action: ActionFunction = async ({
  request,
}) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage
  );
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};

// ...
```

### 💿 Add validation messages to the UI

`app/routes/posts/admin/new.tsx`

```
import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

// ...

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  const errors = useActionData();

  return (
    <Form method="post">
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
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">
              {errors.markdown}
            </em>
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
```

### Typescript fix

`app/routes/posts/admin/new.tsx`

```
//...
import invariant from "tiny-invariant";
// ..

export const action: ActionFunction = async ({
  request,
}) => {
  // ...
  invariant(
    typeof title === "string",
    "title must be a string"
  );
  invariant(
    typeof slug === "string",
    "slug must be a string"
  );
  invariant(
    typeof markdown === "string",
    "markdown must be a string"
  );

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};
```

## Progressive Enhancement

- branch `stage-8-progressive-enhancement`

### 💿 Slow down our action with a fake delay

`app/routes/posts/admin/new.tsx`

```
// ...
export const action: ActionFunction = async ({
  request,
}) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  // ...
};
//...
```

### 💿 Add some pending UI with useTransition

`app/routes/posts/admin/new.tsx`

```
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useTransition,
} from "@remix-run/react";

// ..

export default function NewPost() {
  const errors = useActionData();

  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post">
      {/* ... */}
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Post"}
        </button>
      </p>
    </Form>
  );
}
```

## Homework

Here are more things for you to learn :)

_Update/Delete posts_: make an /admin/$slug.tsx page for your posts. This should open an edit page for the post that allows you to update the post or even delete it. The links are already there in the sidebar but they return 404! Create a new route that reads the posts, and puts them into the fields. All the code you need is already in app/routes/posts/$slug.tsx and app/routes/posts/admin/new.tsx. You just gotta put it together.

_Optimistic UI_: You know how when you favorite a tweet, the heart goes red instantly and if the tweet is deleted it reverts back to empty? That's Optimistic UI: assume the request will succeed, and render what the user will see if it does. So your homework is to make it so when you hit "Create" it renders the post in the left nav and renders the "Create a New Post" link (or if you add update/delete do it for those too). You'll find this ends up being easier than you think even if it takes you a second to arrive there (and if you've implemented this pattern in the past, you'll find Remix makes this much easier). Learn more from the Optimistic UI guide.

_Authenticated users only_: Another cool bit of homework you could do is make it so only authenticated users can create posts. You've already got authentication all set up for you thanks to the Indie Stack. Tip, if you want to make it so you're the only one who can make posts, then simply check the user's email in your loaders and actions and if it's not yours redirect them somewhere 😈

_Customize the app_: If you're happy with tailwind, keep it around, otherwise, check the styling guide to learn of other options. Remove the Notes model and routes, etc. Whatever you want to make this thing yours.

Deploy the app: Check the README of your project. It has instructions you can follow to get your app deployed to Fly.io. Then you can actually start blogging!

# Credits

This tutorial was taken from the [Remix website tutorial](https://remix.run/docs/en/v1/tutorials/blog)
