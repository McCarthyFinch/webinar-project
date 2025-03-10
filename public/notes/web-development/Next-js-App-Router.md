# Next.js App Router

Understanding the new App Router in Next.js 13+ for file-based routing.

## Directory Structure
```
app/
├── layout.js
├── page.js
├── about/
│   └── page.js
├── blog/
│   ├── [slug]/
│   │   └── page.js
│   └── page.js
└── api/
    └── route.js
```

## Route Types
1. **Static Routes**
   ```typescript
   // app/about/page.tsx
   export default function About() {
     return <h1>About Us</h1>
   }
   ```

2. **Dynamic Routes**
   ```typescript
   // app/blog/[slug]/page.tsx
   export default function BlogPost({ params }) {
     return <h1>Post: {params.slug}</h1>
   }
   ```

3. **Route Handlers**
   ```typescript
   // app/api/posts/route.ts
   export async function GET() {
     return Response.json({ posts: [] })
   }
   ```

## Special Files
- `layout.js`: Shared layouts
- `loading.js`: Loading UI
- `error.js`: Error boundaries
- `not-found.js`: 404 pages

## Best Practices
1. Use meaningful route segments
2. Implement proper error handling
3. Add loading states
4. Optimize for performance

Last Updated: 2024-03-20 