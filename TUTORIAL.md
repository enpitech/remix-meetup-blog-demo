# Demo instructions

## First Route

- 💿 Add a link to posts in app/routes/index.tsx

``<div className="mx-auto mt-16 max-w-7xl text-center">

  <Link
    to="/posts"
    className="text-xl text-blue-600 underline"
  >
    Blog Posts
  </Link>
</div>``

- 💿 Create a new file in app/routes/posts/index.tsx
- Create the Posts component

`export default function Posts() { return ( <main> <h1>Posts</h1> </main> ); }`

- Click on the link 🎉
