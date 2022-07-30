# Demo instructions

## First Route

### 💿 Add a link to posts in app/routes/index.tsx

``<div className="mx-auto mt-16 max-w-7xl text-center">

  <Link
    to="/posts"
    className="text-xl text-blue-600 underline"
  >
    Blog Posts
  </Link>
</div>``

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
