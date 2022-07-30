# Demo instructions

## First Route

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
