# Next.js 16 Documentation

**Release Date:** October 21st, 2025  
**Version:** 16.0.0+

This documentation covers all the new features, improvements, breaking changes, and migration guides for Next.js 16.

---

## Table of Contents

1. [Upgrade Guide](#upgrade-guide)
2. [New Features](#new-features)
3. [Developer Experience Improvements](#developer-experience-improvements)
4. [Core Features & Architecture](#core-features--architecture)
5. [Breaking Changes](#breaking-changes)
6. [Behavior Changes](#behavior-changes)
7. [Deprecations](#deprecations)
8. [Migration Guide](#migration-guide)
9. [Additional Improvements](#additional-improvements)

---

## Upgrade Guide

### Automated Upgrade

Use the automated upgrade CLI:

```bash
npx @next/codemod@canary upgrade latest
```

### Manual Upgrade

```bash
npm install next@latest react@latest react-dom@latest
```

### New Project

```bash
npx create-next-app@latest
```

> **Note:** For cases where the codemod can't fully migrate your code, please refer to the detailed migration guide below.

---

## New Features

### Cache Components

Cache Components are a new set of features designed to make caching in Next.js both more explicit and more flexible. They center around the new `"use cache"` directive, which can be used to cache pages, components, and functions, and which leverages the compiler to automatically generate cache keys wherever it's used.

**Key Benefits:**
- Unlike implicit caching in previous versions, caching with Cache Components is entirely opt-in
- All dynamic code in any page, layout, or API route is executed at request time by default
- Better aligned with developer expectations from a full-stack application framework
- Completes the Partial Prerendering (PPR) story introduced in 2023

**Enabling Cache Components:**

```typescript
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

**How It Works:**
- Prior to PPR, Next.js had to choose whether to render each URL statically or dynamically
- PPR eliminated this dichotomy, letting developers opt portions of their static pages into dynamic rendering (via Suspense) without sacrificing fast initial load
- Cache Components complete this story with explicit caching directives

> **Note:** The previous experimental `experimental.ppr` flag and configuration options have been removed in favor of the Cache Components configuration.

**Example Usage:**

```typescript
"use cache";

export async function getData() {
  // This function will be cached
  const res = await fetch('https://api.example.com/data');
  return res.json();
}
```

### Next.js Devtools MCP

Next.js 16 introduces **Next.js DevTools MCP**, a Model Context Protocol integration for AI-assisted debugging with contextual insight into your application.

**Features:**
- **Next.js knowledge**: Routing, caching, and rendering behavior
- **Unified logs**: Browser and server logs without switching contexts
- **Automatic error access**: Detailed stack traces without manual copying
- **Page awareness**: Contextual understanding of the active route

This enables AI agents to diagnose issues, explain behavior, and suggest fixes directly within your development workflow.

### proxy.ts (formerly middleware.ts)

`proxy.ts` replaces `middleware.ts` and makes the app's network boundary explicit. `proxy.ts` runs on the Node.js runtime.

**Migration Steps:**
1. Rename `middleware.ts` → `proxy.ts`
2. Rename the exported function to `proxy`
3. Logic stays the same

**Example:**

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}
```

**Why the Change:**
- Clearer naming that reflects the network boundary
- Single, predictable runtime for request interception
- Better alignment with Next.js architecture

> **Note:** The `middleware.ts` file is still available for Edge runtime use cases, but it is deprecated and will be removed in a future version.

### Logging Improvements

Next.js 16 extends development request logs to show where time is spent:

- **Compile**: Routing and compilation
- **Render**: Running your code and React rendering

Build logs are also extended to show where time is spent. Each step in the build process is now shown with the time it took to complete:

```
   ▲ Next.js 16 (Turbopack)

 ✓ Compiled successfully in 615ms
 ✓ Finished TypeScript in 1114ms
 ✓ Collecting page data in 208ms
 ✓ Generating static pages in 239ms
 ✓ Finalizing page optimization in 5ms
```

---

## Developer Experience Improvements

### Turbopack (Stable)

Turbopack has reached stability for both development and production builds, and is now the default bundler for all new Next.js projects.

**Performance Improvements:**
- **2–5× faster production builds**
- **Up to 10× faster Fast Refresh**

**Adoption Stats:**
- More than 50% of development sessions on Next.js 15.3+ are running on Turbopack
- 20% of production builds on Next.js 15.3+ are using Turbopack

**Opting Out:**
For apps with custom webpack setups, you can continue using webpack:

```bash
next dev --webpack
next build --webpack
```

### Turbopack File System Caching (Beta)

Turbopack now supports filesystem caching in development, storing compiler artifacts on disk between runs for significantly faster compile times across restarts, especially in large projects.

**Enabling:**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
```

**Benefits:**
- Faster startup times
- Improved developer productivity in large repositories
- All internal Vercel apps are already using this feature

### Simplified create-next-app

`create-next-app` has been redesigned with:
- Simplified setup flow
- Updated project structure
- Improved defaults
- App Router by default
- TypeScript-first configuration
- Tailwind CSS included
- ESLint configured

### Build Adapters API (Alpha)

Following the Build Adapters RFC, the first alpha version of the Build Adapters API is now available.

Build Adapters allow you to create custom adapters that hook into the build process, enabling deployment platforms and custom build integrations to modify Next.js configuration or process build output.

**Configuration:**

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    adapterPath: require.resolve('./my-adapter.js'),
  },
};

module.exports = nextConfig;
```

### React Compiler Support (Stable)

Built-in support for the React Compiler is now stable in Next.js 16 following the React Compiler's 1.0 release. The React Compiler automatically memoizes components, reducing unnecessary re-renders with zero manual code changes.

**Configuration:**

```typescript
// next.config.ts
const nextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

**Installation:**

```bash
npm install babel-plugin-react-compiler@latest
```

> **Note:** The `reactCompiler` configuration option has been promoted from `experimental` to stable. It is not enabled by default as we continue gathering build performance data. Expect compile times in development and during builds to be higher when enabling this option as the React Compiler relies on Babel.

---

## Core Features & Architecture

### Enhanced Routing and Navigation

Next.js 16 includes a complete overhaul of the routing and navigation system, making page transitions leaner and faster.

#### Layout Deduplication

When prefetching multiple URLs with a shared layout, the layout is downloaded once instead of separately for each Link. For example, a page with 50 product links now downloads the shared layout once instead of 50 times, dramatically reducing the network transfer size.

#### Incremental Prefetching

Next.js only prefetches parts not already in cache, rather than entire pages. The prefetch cache now:

- Cancels requests when the link leaves the viewport
- Prioritizes link prefetching on hover or when re-entering the viewport
- Re-prefetches links when their data is invalidated
- Works seamlessly with upcoming features like Cache Components

### Improved Caching APIs

#### New `updateTag()` Function

A new function for read-your-writes consistency in Server Actions:

```typescript
import { updateTag } from 'next/cache';

export async function updateUser(userId: string, data: UserData) {
  // Update the database
  await db.users.update(userId, data);
  
  // Update the cache tag immediately (read-your-writes)
  updateTag(`user-${userId}`);
}
```

#### Refined `revalidateTag()`

The `revalidateTag()` function now requires a `cacheLife` profile as the second argument for stale-while-revalidate behavior:

```typescript
import { revalidateTag } from 'next/cache';

// Revalidate with stale-while-revalidate behavior
revalidateTag('products', { revalidate: 3600 });
```

### React 19.2 Features

Next.js 16 includes React 19.2 with the following features:

- **View Transitions**: Smooth page transitions
- **`useEffectEvent()`**: New hook for effect events
- **`<Activity/>`**: New component for activity tracking

---

## Breaking Changes

### Removed Features

| Removed | Replacement |
|---------|-------------|
| **AMP support** | All AMP APIs and configs removed (`useAmp`, `export const config = { amp: true }`) |
| **next lint command** | Use Biome or ESLint directly; `next build` no longer runs linting. Codemod available: `npx @next/codemod@canary next-lint-to-eslint-cli` |
| **devIndicators options** | `appIsrStatus`, `buildActivity`, `buildActivityPosition` removed from config. The indicator remains. |
| **serverRuntimeConfig, publicRuntimeConfig** | Use environment variables (`.env` files) |
| **experimental.turbopack location** | Config moved to top-level `turbopack` (no longer in experimental) |
| **experimental.dynamicIO flag** | Renamed to `cacheComponents` |
| **experimental.ppr flag** | PPR flag removed; evolving into Cache Components programming model |
| **export const experimental_ppr** | Route-level PPR export removed; evolving into Cache Components programming model |
| **Automatic scroll-behavior: smooth** | Add `data-scroll-behavior="smooth"` to HTML document to opt back in |
| **unstable_rootParams()** | We are working on an alternative API that we will ship in an upcoming minor |

### API Changes

#### Async Params and SearchParams

Params and searchParams props must now be accessed asynchronously:

```typescript
// ❌ Before (Next.js 15)
export default function Page({ params, searchParams }) {
  const id = params.id;
  const query = searchParams.q;
}

// ✅ After (Next.js 16)
export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const { q } = await searchParams;
}
```

#### Async Cookies, Headers, and DraftMode

Cookies, headers, and draftMode must now be accessed asynchronously:

```typescript
// ❌ Before
import { cookies, headers, draftMode } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const headersList = headers();
  const { isEnabled } = draftMode();
}

// ✅ After
import { cookies, headers, draftMode } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const { isEnabled } = await draftMode();
}
```

#### Metadata Image Route Params

Metadata image route params argument changed to async params:

```typescript
// ❌ Before
export async function generateImageMetadata({ params }) {
  const id = params.id;
}

// ✅ After
export async function generateImageMetadata({ params }) {
  const { id } = await params;
  // id is now Promise<string>
}
```

#### next/image Local Src with Query Strings

Now requires `images.localPatterns` config to prevent enumeration attacks:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
  },
};
```

---

## Behavior Changes

### Default Bundler

**Turbopack is now the default bundler** for all apps. Opt out with:

```bash
next build --webpack
```

### Image Configuration Defaults

| Setting | Old Default | New Default | Notes |
|---------|-------------|-------------|-------|
| **images.minimumCacheTTL** | 60s | 4 hours (14400s) | Reduces revalidation cost for images without cache-control headers |
| **images.imageSizes** | Includes 16 | Removed 16 | Used by only 4.2% of projects; reduces srcset size and API variations |
| **images.qualities** | [1..100] | [75] | Quality prop is now coerced to closest value in images.qualities |
| **images.dangerouslyAllowLocalIP** | Allowed | Blocked | New security restriction blocks local IP optimization by default; set to `true` for private networks only |
| **images.maximumRedirects** | Unlimited | 3 redirects maximum | Set to `0` to disable or increase for rare edge cases |

### ESLint Configuration

**@next/eslint-plugin-next default** now defaults to ESLint Flat Config format, aligning with ESLint v10 which will drop legacy config support.

### Prefetch Cache Behavior

Complete rewrite with:
- Layout deduplication
- Incremental prefetching
- Better cache invalidation

### revalidateTag() Signature

Now requires `cacheLife` profile as second argument for stale-while-revalidate behavior:

```typescript
// ❌ Before
revalidateTag('products');

// ✅ After
revalidateTag('products', { revalidate: 3600 });
```

### Babel Configuration in Turbopack

Automatically enables Babel if a babel config is found (previously exited with hard error).

### Terminal Output

Redesigned with:
- Clearer formatting
- Better error messages
- Improved performance metrics

### Dev and Build Output Directories

`next dev` and `next build` now use separate output directories, enabling concurrent execution.

### Lockfile Behavior

Added lockfile mechanism to prevent multiple `next dev` or `next build` instances on the same project.

### Parallel Routes default.js

All parallel route slots now require explicit `default.js` files; builds fail without them. Create `default.js` that calls `notFound()` or returns `null` for previous behavior:

```typescript
// app/@analytics/default.tsx
export default function Default() {
  return null;
}
```

### Modern Sass API

Bumped `sass-loader` to v16, which supports modern Sass syntax and new features.

---

## Deprecations

These features are deprecated in Next.js 16 and will be removed in a future version:

| Deprecated | Details |
|------------|---------|
| **middleware.ts filename** | Rename to `proxy.ts` to clarify network boundary and routing focus |
| **next/legacy/image component** | Use `next/image` instead for improved performance and features |
| **images.domains config** | Use `images.remotePatterns` config instead for improved security restriction |
| **revalidateTag() single argument** | Use `revalidateTag(tag, profile)` for SWR, or `updateTag(tag)` in Actions for read-your-writes |

---

## Migration Guide

### Step 1: Upgrade Dependencies

```bash
npm install next@latest react@latest react-dom@latest
```

### Step 2: Run Codemod

```bash
npx @next/codemod@canary upgrade latest
```

### Step 3: Update Async APIs

#### Update Params and SearchParams

```typescript
// Find all page components
// Before:
export default function Page({ params, searchParams }) {
  const id = params.id;
}

// After:
export default async function Page({ params, searchParams }) {
  const { id } = await params;
}
```

#### Update Cookies, Headers, DraftMode

```typescript
// Before:
import { cookies } from 'next/headers';
const cookieStore = cookies();

// After:
import { cookies } from 'next/headers';
const cookieStore = await cookies();
```

### Step 4: Migrate middleware.ts to proxy.ts

```bash
# Rename the file
mv middleware.ts proxy.ts
```

```typescript
// Update the export
// Before:
export function middleware(request: NextRequest) { }

// After:
export default function proxy(request: NextRequest) { }
```

### Step 5: Update Image Configuration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    // If you need local images with query strings
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    // Update remote patterns if using domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
};
```

### Step 6: Update Parallel Routes

Add `default.tsx` files for all parallel route slots:

```typescript
// app/@analytics/default.tsx
export default function Default() {
  return null;
}
```

### Step 7: Update Cache Tag Usage

```typescript
// Before:
revalidateTag('products');

// After:
revalidateTag('products', { revalidate: 3600 });

// Or use updateTag for read-your-writes:
import { updateTag } from 'next/cache';
updateTag('products');
```

### Step 8: Enable Cache Components (Optional)

```typescript
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};
```

### Step 9: Update ESLint Configuration

If using ESLint, update to Flat Config format:

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
```

### Step 10: Test Your Application

1. Run `npm run dev` and test all routes
2. Check for any console errors or warnings
3. Test image loading and optimization
4. Verify caching behavior
5. Test Server Actions and API routes

---

## Additional Improvements

### Performance Improvements

Significant performance optimizations for:
- `next dev` command
- `next start` command
- Build process
- Runtime performance

### Node.js Native TypeScript for next.config.ts

Run `next dev`, `next build`, and `next start` commands with `--experimental-next-config-strip-types` flag to enable native TypeScript for `next.config.ts`:

```bash
next dev --experimental-next-config-strip-types
```

---

## Resources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [GitHub Issues](https://github.com/vercel/next.js/issues)
- [Discord Community](https://nextjs.org/discord)

---

## Summary

Next.js 16 brings significant improvements in:

- **Performance**: Turbopack as default, faster builds and Fast Refresh
- **Developer Experience**: Better logging, simplified setup, improved tooling
- **Caching**: New Cache Components model with explicit caching
- **Architecture**: Enhanced routing, improved prefetching, better caching APIs
- **React**: Full support for React 19.2 features

The migration path is straightforward with automated codemods, but some manual updates are required for async APIs and configuration changes.

---

**Last Updated:** October 21st, 2025  
**Next.js Version:** 16.0.0+

