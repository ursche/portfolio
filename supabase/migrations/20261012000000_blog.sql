-- Blog: posts, author allowlist, cover/inline image storage.
--
-- Write access is decided entirely in the database: anyone can sign in with
-- GitHub, but only GitHub accounts listed in public.blog_authors pass the
-- RLS policies below. The Next.js app checks the same function for UX only.

-- ---------------------------------------------------------------------------
-- Allowlist
-- ---------------------------------------------------------------------------
create table public.blog_authors (
  github_username text primary key,
  created_at timestamptz not null default now()
);

-- No policies: the table is invisible to the anon/authenticated roles and can
-- only be edited from the dashboard / SQL editor (service role).
alter table public.blog_authors enable row level security;

-- Matches against auth.identities rather than the JWT's user_metadata,
-- because user_metadata can be overwritten by the user via auth.updateUser().
-- identity_data is written by Supabase Auth from GitHub on every sign-in.
create or replace function public.is_blog_author()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.identities i
    join public.blog_authors a
      on lower(a.github_username) = lower(i.identity_data ->> 'user_name')
    where i.user_id = auth.uid()
      and i.provider = 'github'
  );
$$;

revoke all on function public.is_blog_author() from public;
grant execute on function public.is_blog_author() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '',
  subtitle text not null default '',
  cover_image_url text,
  -- Tiptap/ProseMirror JSON document
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  excerpt text not null default '',
  reading_minutes integer not null default 1,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);

create or replace function public.posts_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  -- Stamp the first publish; keep the original date on later edits.
  if new.published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger posts_touch
before insert or update on public.posts
for each row execute function public.posts_touch();

alter table public.posts enable row level security;

create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (published or (select public.is_blog_author()));

create policy "Authors can insert posts"
  on public.posts for insert
  to authenticated
  with check ((select public.is_blog_author()) and author_id = (select auth.uid()));

create policy "Authors can update posts"
  on public.posts for update
  to authenticated
  using ((select public.is_blog_author()))
  with check ((select public.is_blog_author()));

create policy "Authors can delete posts"
  on public.posts for delete
  to authenticated
  using ((select public.is_blog_author()));

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket, author-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

create policy "Authors can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and (select public.is_blog_author()));

create policy "Authors can update blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and (select public.is_blog_author()));

create policy "Authors can delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and (select public.is_blog_author()));

-- ---------------------------------------------------------------------------
-- Add yourself (run once, with your GitHub username):
--   insert into public.blog_authors (github_username) values ('ursche');
-- ---------------------------------------------------------------------------
