create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  category text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Public read"
  on public.posts for select
  using (true);

create policy "Public insert"
  on public.posts for insert
  with check (
    category = 'free'
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Public update"
  on public.posts for update
  using (
    category = 'free'
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
  with check (
    category = 'free'
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Public delete"
  on public.posts for delete
  using (
    category = 'free'
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create table public.main_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  link_url text,
  order_index integer,
  created_at timestamptz not null default now()
);

alter table public.main_banners enable row level security;

create policy "Public read banners"
  on public.main_banners for select
  using (true);

create policy "Admin insert banners"
  on public.main_banners for insert
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin update banners"
  on public.main_banners for update
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete banners"
  on public.main_banners for delete
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create table public.seo_settings (
  page_key text primary key,
  title text,
  description text,
  og_image_url text,
  updated_at timestamptz not null default now()
);

alter table public.seo_settings enable row level security;

create policy "Public read seo"
  on public.seo_settings for select
  using (true);

create policy "Admin upsert seo"
  on public.seo_settings for insert
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin update seo"
  on public.seo_settings for update
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete seo"
  on public.seo_settings for delete
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_menus (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  link_url text,
  parent_id uuid references public.cms_menus(id) on delete cascade,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cms_pages enable row level security;
alter table public.cms_menus enable row level security;

create policy "Public read pages"
  on public.cms_pages for select
  using (is_published = true);

create policy "Public read menus"
  on public.cms_menus for select
  using (is_active = true);

create policy "Admin insert pages"
  on public.cms_pages for insert
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin update pages"
  on public.cms_pages for update
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete pages"
  on public.cms_pages for delete
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin insert menus"
  on public.cms_menus for insert
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin update menus"
  on public.cms_menus for update
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete menus"
  on public.cms_menus for delete
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Public read page images"
  on storage.objects for select
  using (bucket_id = 'page-images');

create policy "Admin upload page images"
  on storage.objects for insert
  with check (
    bucket_id = 'page-images'
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete page images"
  on storage.objects for delete
  using (
    bucket_id = 'page-images'
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Public read seo images"
  on storage.objects for select
  using (bucket_id = 'seo-images');

create policy "Admin upload seo images"
  on storage.objects for insert
  with check (
    bucket_id = 'seo-images'
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Admin delete seo images"
  on storage.objects for delete
  using (
    bucket_id = 'seo-images'
    and exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

alter table public.posts
  add column if not exists image_url text;

alter table public.posts
  add column if not exists category text not null default 'free';

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  budget text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create policy "Public insert inquiries"
  on public.inquiries for insert
  with check (true);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admin self read"
  on public.admin_users for select
  using (auth.uid() = user_id);

create policy "Admin read inquiries"
  on public.inquiries for select
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );
