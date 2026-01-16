# Technical Guide: Astro Stack

This is the master implementation guide for Astro-based projects. It defines the complete technology stack and provides setup instructions.

## When to Use This Stack

Use the Astro stack when:
- The site is primarily content-driven (blogs, docs, marketing, portfolios)
- SEO is important
- Performance and minimal JavaScript are priorities
- Interactive components are isolated (islands architecture)
- Traditional page navigation is acceptable

See [Astro Decision Guide](./astro-decision-guide.md) for detailed criteria.

---

## Technology Stack

| Layer | Technology | Guide |
|-------|------------|-------|
| Framework | Astro | — |
| UI Components | React (islands) | [Frontend Framework Guide](./frontend-framework-guide.md) |
| Component Library | shadcn/ui | [shadcn Guide](./shadcn-guide.md) |
| Styling | Tailwind CSS | — |
| Backend | Express | [Backend Framework Guide](./backend-framework-guide.md) |
| API (Internal) | tRPC | [API Style Guide](./api-style-guide.md) |
| API (External) | REST | [API Style Guide](./api-style-guide.md) |
| Database | Neon (Postgres) | [Database & Storage Guide](./database-storage-guide.md) |
| ORM | Drizzle | [ORM Guide](./orm-guide.md) |
| Blob Storage | Netlify Blob | [Database & Storage Guide](./database-storage-guide.md) |
| Authentication | Clerk | [Authentication Guide](./authentication-guide.md) |
| Deployment | Netlify | [Deployment Guide](./deployment-guide.md) |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── Header.astro        # Astro components
│   │   ├── Footer.astro
│   │   └── ContactForm.tsx     # React islands
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── api/                # API routes (if using Astro endpoints)
│   ├── lib/
│   │   ├── utils.ts            # cn() helper
│   │   └── trpc.ts             # tRPC client
│   ├── db/
│   │   ├── index.ts            # Drizzle client
│   │   └── schema.ts           # Drizzle schema
│   ├── server/
│   │   ├── trpc/
│   │   │   ├── router.ts
│   │   │   ├── context.ts
│   │   │   └── procedures/
│   │   └── rest/
│   │       └── routes/
│   └── styles/
│       └── globals.css         # Tailwind + shadcn CSS variables
├── netlify/
│   └── functions/
│       ├── api.ts              # Express serverless function
│       └── trpc.ts             # tRPC serverless function
├── public/
├── drizzle/                    # Migration files
├── astro.config.mjs
├── tailwind.config.js
├── drizzle.config.ts
├── netlify.toml
├── package.json
└── tsconfig.json
```

---

## External Service Setup

Before starting the project, set up these external services.

### Neon Database Setup

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard
   - Use the **pooled** connection string for serverless (default)
   - Format: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`
4. For preview deployments with database branching:
   - Install the Neon integration in Netlify
   - Neon will automatically create database branches for preview deploys

### Clerk Setup

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy keys from the API Keys section:
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
4. Configure OAuth providers (optional):
   - Dashboard → User & Authentication → Social Connections
   - Toggle on desired providers (Google, GitHub, etc.)
   - For Google: Add your OAuth client ID and secret from Google Cloud Console
   - For GitHub: Add OAuth app credentials from GitHub Developer Settings
5. Configure redirect URLs:
   - Dashboard → User & Authentication → Email, Phone, Username
   - Add your production domain when ready

### Netlify Setup

1. Go to [netlify.com](https://netlify.com) and create an account
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select the repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables:
   - Site settings → Environment variables
   - Add: `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
6. For custom domains:
   - Domain settings → Add custom domain
   - Configure DNS as instructed
   - SSL is provisioned automatically

---

## Initial Setup

### 1. Create Project

```bash
npm create astro@latest my-project
cd my-project
```

Select:
- Template: Empty
- TypeScript: Yes (strict)
- Install dependencies: Yes

### 2. Add Integrations

```bash
npx astro add react tailwind netlify
```

### 3. Configure Astro

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import netlify from '@astrojs/netlify'

export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
})
```

### 4. Install shadcn

```bash
npx shadcn@latest init
```

When prompted, select:
- Which style would you like to use? › **Default**
- Which color would you like to use as base color? › **Slate**
- Would you like to use CSS variables for colors? › **Yes**

This creates `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

Install baseline components:

```bash
npx shadcn@latest add button input label textarea card dialog sheet select dropdown-menu toast form table tabs avatar badge separator skeleton switch checkbox radio-group
```

### 5. Install Backend Dependencies

```bash
# Server
npm install express cors helmet
npm install -D @types/express @types/cors

# tRPC
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Auth
npm install @clerk/astro @clerk/express

# Netlify
npm install @netlify/functions @netlify/blobs serverless-http

# Utilities
npm install @paralleldrive/cuid2
```

### 6. Set Up CSS with shadcn Variables

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 7. Create the cn() Utility

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 8. Configure Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### 9. Configure TypeScript

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Database Setup

### Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### Database Client

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

### Schema

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Add more tables as needed
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "netlify dev",
    "dev:astro": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## tRPC Setup

### Router

```typescript
// src/server/trpc/router.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { userId: ctx.userId } })
})

export const appRouter = t.router({
  users: t.router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.query.users.findFirst({
        where: eq(users.clerkId, ctx.userId),
      })
    }),
  }),
})

export type AppRouter = typeof appRouter
```

### Context

```typescript
// src/server/trpc/context.ts
import { getAuth } from '@clerk/express'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

export async function createContext({ req }: CreateExpressContextOptions) {
  const auth = getAuth(req)
  return {
    userId: auth.userId,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

### Client

```typescript
// src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/trpc/router'

export const trpc = createTRPCReact<AppRouter>()
```

---

## Netlify Functions

### tRPC Function

```typescript
// netlify/functions/trpc.ts
import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda'
import { appRouter } from '../../src/server/trpc/router'
import { createContext } from '../../src/server/trpc/context'

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
})
```

### REST API Function (if needed)

```typescript
// netlify/functions/api.ts
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import { ClerkExpressRequireAuth } from '@clerk/express'

const app = express()
app.use(cors())
app.use(express.json())

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Protected routes
app.use('/api/v1', ClerkExpressRequireAuth())

app.get('/api/v1/example', (req, res) => {
  res.json({ userId: req.auth.userId })
})

export const handler = serverless(app)
```

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/trpc/*"
  to = "/.netlify/functions/trpc/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

---

## Authentication

### Astro Integration

```typescript
// astro.config.mjs
import clerk from '@clerk/astro'

export default defineConfig({
  // ...
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    clerk(),
  ],
})
```

### Protected Pages

```astro
---
// src/pages/dashboard.astro
const { userId } = Astro.locals.auth()

if (!userId) {
  return Astro.redirect('/sign-in')
}
---

<BaseLayout>
  <h1>Dashboard</h1>
</BaseLayout>
```

### React Islands with Auth

```tsx
// src/components/UserProfile.tsx
import { useAuth, UserButton } from '@clerk/clerk-react'

export function UserProfile() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return null

  return <UserButton />
}
```

```astro
---
// Usage in .astro file
import { UserProfile } from '@/components/UserProfile'
---

<UserProfile client:load />
```

---

## Blob Storage

```typescript
// src/lib/storage.ts
import { getStore } from '@netlify/blobs'

const uploads = getStore('uploads')

export async function uploadFile(key: string, data: Buffer, contentType: string) {
  await uploads.set(key, data, {
    metadata: { contentType },
  })
  return key
}

export async function getFileUrl(key: string) {
  const blob = await uploads.get(key, { type: 'blob' })
  return blob
}

export async function deleteFile(key: string) {
  await uploads.delete(key)
}
```

---

## Environment Variables

### Local Development

Create a `.env` file in the project root:

```env
# .env
DATABASE_URL="postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

Add `.env` to `.gitignore`:

```
# .gitignore
.env
.env.local
```

### Netlify

Set in Dashboard → Site settings → Environment variables:
- `DATABASE_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

## Development Workflow

### Start Development

Use Netlify CLI to run the full stack locally (frontend + functions):

```bash
npm install -g netlify-cli
netlify dev
```

This starts:
- Astro dev server
- Netlify Functions locally
- Proper routing between them

For frontend-only development (without API):

```bash
npm run dev:astro
```

### Database Changes

```bash
# Development (quick iteration — pushes schema directly)
npm run db:push

# Production (tracked migrations)
npm run db:generate
npm run db:migrate

# Browse data
npm run db:studio
```

### Deploy

Push to main branch — Netlify deploys automatically.

Preview deployments created for pull requests.

---

## Checklist

### External Services
- [ ] Neon account created
- [ ] Neon project created, connection string copied
- [ ] Clerk account created
- [ ] Clerk application created, API keys copied
- [ ] Clerk OAuth providers configured (if needed)
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Environment variables set in Netlify dashboard

### Project Setup
- [ ] Astro project created with React, Tailwind, Netlify adapter
- [ ] shadcn initialized with baseline components
- [ ] `globals.css` has shadcn CSS variables
- [ ] `utils.ts` has `cn()` helper
- [ ] Tailwind config has shadcn theme colors
- [ ] TypeScript paths configured

### Backend
- [ ] Drizzle schema defined
- [ ] Database migrated (`db:push` or `db:migrate`)
- [ ] tRPC router created with protected procedures
- [ ] tRPC context extracts Clerk userId
- [ ] Netlify functions set up for tRPC and REST

### Authentication
- [ ] Clerk integration added to Astro config
- [ ] Protected pages check `Astro.locals.auth()`
- [ ] React islands use Clerk hooks correctly

### Deployment
- [ ] `netlify.toml` configured with redirects
- [ ] Build command and publish directory correct
- [ ] All environment variables set
- [ ] Custom domain configured (if applicable)
