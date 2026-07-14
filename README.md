# GoToWorship

A US places-of-worship directory built with **Next.js 14**, **Supabase**, and **DeepSeek AI**.

## Features

### MVP (Fase 1)

- Public directory with city/state pages and detail pages.
- `/near-me` location-based search.
- Admin CSV import.
- Contributor event submission with admin moderation.
- Admin dashboard for places, users, events, and imports.
- SEO: dynamic metadata, JSON-LD schema, sitemap.

### Fase 2

- **Queue-based CSV import**: upload CSV, then run a worker to process images and generate AI content in the background.
- **CMS Blog**: admin CRUD for categories and posts; public `/blog` and `/blog/[slug]`.
- **CMS Pages**: admin CRUD for static pages; public `/p/[slug]`.
- **SEO enhancements**: `robots.txt`, canonical URLs, Open Graph tags, BreadcrumbList schema.

## Tech Stack

- Next.js 14 App Router + React Server Components
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- DeepSeek API
- Sharp (image processing)
- Mapbox GL JS (optional)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**

   - Go to [https://supabase.com](https://supabase.com) and create a new project.
   - Run the SQL migrations in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_phase2_queue_cms.sql`
   - Create a public storage bucket named `place-images` if it was not created by the migration.

3. **Configure environment variables**

   Copy `.env.local` to your own values:

   ```env
   DEEPSEEK_API_KEY=your-deepseek-api-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

   If you do not have a DeepSeek key, the app will generate fallback content.
   If you do not have a Mapbox token, maps will fall back to coordinates and Google Maps links.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Create the first admin user**

   - Register a new account at `/register`.
   - In Supabase SQL Editor, run:

     ```sql
     UPDATE public.profiles
     SET role = 'admin', approved = true
     WHERE email = 'your-admin-email@example.com';
     ```

   - Log in again to access `/admin`.

## CSV Import (Queue)

1. Go to `/admin/import` and upload `sample-places.csv`.
2. Each row is inserted as a `place` with status `draft` and a `job_queue` entry is created.
3. Run the worker to process images and generate AI content:

   ```bash
   npm run queue:worker
   ```

   On a VPS, schedule this command with cron or run it under PM2:

   ```bash
   # run every 5 minutes
   */5 * * * * cd /path/to/app && npm run queue:worker
   ```

4. Monitor the queue at `/admin/queue`.
5. Publish processed places from `/admin/places`.

## CMS Blog & Pages

- Manage blog posts: `/admin/blog/posts`
- Manage categories: `/admin/blog/categories`
- Manage static pages: `/admin/pages`
- Public blog: `/blog`
- Public static page: `/p/[slug]`

## CSV Import Format

See `sample-places.csv` for an example. Required columns:

- `name`
- `city`
- `state`
- `religion`
- `latitude`
- `longitude`

Optional columns: `address`, `zip`, `denomination`, `phone`, `website`, `email`, `language`, `facilities`, `image_url1`, `image_url2`, `image_url3`, `schedule_notes`.

## Deployment

Deploy to Vercel or your own VPS and add the environment variables from `.env.local`.

```bash
vercel
```

On a VPS:

```bash
npm run build
npm start
```

## Roadmap

- Fase 3: user reviews, notifications, advanced analytics.
