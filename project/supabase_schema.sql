-- Aksara Supabase schema. Run this in the Supabase SQL Editor.
-- Public reads are allowed for published stories, chapters, comments, and donations.
-- All user-owned writes require Supabase Auth. Promote the solo writer using the
-- final SQL statement after creating that account in Authentication.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'reader' check (role in ('reader', 'writer')),
  display_name text not null default 'คุณ',
  bio text not null default '',
  avatar_url text,
  is_vip boolean not null default false,
  auto_renew boolean not null default false,
  coins integer not null default 0 check (coins >= 0),
  has_next_month_discount boolean not null default false,
  reading_theme text not null default 'paper' check (reading_theme in ('paper', 'sepia', 'night')),
  font_family text not null default 'plex' check (font_family in ('plex', 'sarabun')),
  font_size integer not null default 18 check (font_size between 14 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists coins integer not null default 0 check (coins >= 0);
alter table public.profiles add column if not exists has_next_month_discount boolean not null default false;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'คุณ')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create table if not exists public.stories (
  id text primary key,
  author_id uuid not null references public.profiles(id),
  title text not null,
  status text not null check (status in ('published', 'draft')),
  tags text[] not null default '{}',
  category text not null default '',
  horizontal_cover_url text,
  read_count bigint not null default 0 check (read_count >= 0),
  like_count bigint not null default 0 check (like_count >= 0),
  bookmark_count bigint not null default 0 check (bookmark_count >= 0),
  data jsonb not null default '{}'::jsonb,
  created_at bigint not null,
  updated_at bigint not null
);
alter table public.stories add column if not exists horizontal_cover_url text;

create table if not exists public.chapters (
  id text primary key,
  story_id text not null references public.stories(id) on delete cascade,
  number integer not null,
  status text not null check (status in ('published', 'draft')),
  access text not null check (access in ('free', 'vip')),
  read_count bigint not null default 0 check (read_count >= 0),
  data jsonb not null default '{}'::jsonb,
  created_at bigint not null,
  unique (story_id, number)
);

create table if not exists public.chapter_contents (
  chapter_id text primary key references public.chapters(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  content text not null default '',
  author_note text not null default ''
);
alter table public.chapter_contents add column if not exists author_note text not null default '';

create table if not exists public.comments (
  id text primary key,
  story_id text not null references public.stories(id) on delete cascade,
  chapter_id text not null references public.chapters(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author text not null,
  avatar_color text not null,
  avatar_url text,
  is_vip boolean not null default false,
  text text not null default '',
  is_sticker boolean not null default false,
  sticker jsonb,
  donation jsonb,
  created_at bigint not null
);
alter table public.comments add column if not exists is_sticker boolean not null default false;
alter table public.comments add column if not exists sticker jsonb;

create table if not exists public.tips (
  id text primary key,
  story_id text not null references public.stories(id) on delete cascade,
  chapter_id text not null references public.chapters(id) on delete cascade,
  donor_id uuid not null references public.profiles(id),
  donor text not null,
  amount integer not null check (amount in (9, 19, 29, 59, 99, 199, 499, 999, 1999)),
  label text not null,
  sticker_id text,
  sticker_emoji text,
  payment_method text not null check (payment_method in ('card', 'promptpay', 'wallet')),
  payment_status text not null default 'simulated' check (payment_status in ('simulated', 'paid')),
  coins_rewarded boolean not null default false,
  created_at bigint not null
);
alter table public.tips add column if not exists coins_rewarded boolean not null default false;

create table if not exists public.user_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table if not exists public.user_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id text not null references public.stories(id) on delete cascade,
  chapter_id text not null references public.chapters(id) on delete cascade,
  percent integer not null default 0 check (percent between 0 and 100),
  updated_at bigint not null,
  primary key (user_id, story_id)
);

create table if not exists public.vip_subscriptions (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id text references public.stories(id) on delete set null,
  created_at bigint not null
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('vip_subscription', 'donation', 'coin_redemption')),
  amount numeric(10, 2) not null default 0 check (amount >= 0),
  coins integer not null default 0,
  status text not null check (status in ('pending', 'completed', 'failed')),
  details jsonb not null default '{}'::jsonb,
  source_type text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  unique (source_type, source_id)
);

create table if not exists public.writer_notifications (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('comment', 'like', 'vip', 'donation')),
  story_id text references public.stories(id) on delete cascade,
  chapter_id text references public.chapters(id) on delete cascade,
  message text not null,
  created_at bigint not null
);

create table if not exists public.view_events (
  id bigint generated always as identity primary key,
  story_id text not null references public.stories(id) on delete cascade,
  chapter_id text references public.chapters(id) on delete cascade,
  session_id uuid not null,
  created_at timestamptz not null default now()
);
create table if not exists public.legacy_migrations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  migration_key text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, migration_key)
);
create unique index if not exists view_events_story_once
  on public.view_events(story_id, session_id) where chapter_id is null;
create unique index if not exists view_events_chapter_once
  on public.view_events(story_id, chapter_id, session_id) where chapter_id is not null;

create index if not exists stories_published_updated_idx on public.stories(status, updated_at desc);
create index if not exists stories_tags_idx on public.stories using gin(tags);
create index if not exists chapters_story_number_idx on public.chapters(story_id, number);
create index if not exists comments_chapter_created_idx on public.comments(chapter_id, created_at desc);
create index if not exists tips_story_created_idx on public.tips(story_id, created_at desc);
create index if not exists transactions_user_created_idx on public.transactions(user_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608;
drop policy if exists "Public can view profile avatars" on storage.objects;
create policy "Public can view profile avatars" on storage.objects for select to anon, authenticated
  using (bucket_id = 'profile-avatars');
drop policy if exists "Users upload own profile avatars" on storage.objects;
create policy "Users upload own profile avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users update own profile avatars" on storage.objects;
create policy "Users update own profile avatars" on storage.objects for update to authenticated
  using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users delete own profile avatars" on storage.objects;
create policy "Users delete own profile avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.is_writer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'writer'
  );
$$;

create or replace function public.record_story_view(p_story_id text, p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.view_events(story_id, session_id)
  select s.id, p_session_id
  from public.stories s
  where s.id = p_story_id and s.status = 'published'
  on conflict (story_id, session_id) where chapter_id is null do nothing;

  if found then
    update public.stories set read_count = read_count + 1 where id = p_story_id;
  end if;
end;
$$;

create or replace function public.record_chapter_view(p_story_id text, p_chapter_id text, p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  chapter_access text;
begin
  select c.access into chapter_access
  from public.chapters c
  join public.stories s on s.id = c.story_id
  where c.id = p_chapter_id and c.story_id = p_story_id
    and c.status = 'published' and s.status = 'published';

  if chapter_access is null or (chapter_access = 'vip' and not exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_vip
  )) then
    return;
  end if;

  insert into public.view_events(story_id, chapter_id, session_id)
  values (p_story_id, p_chapter_id, p_session_id)
  on conflict (story_id, chapter_id, session_id) where chapter_id is not null do nothing;

  if found then
    update public.chapters set read_count = read_count + 1 where id = p_chapter_id;
  end if;
end;
$$;

create or replace function public.adjust_story_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_story text;
  delta integer;
begin
  target_story := coalesce(new.story_id, old.story_id);
  delta := case when tg_op = 'INSERT' then 1 else -1 end;
  if tg_table_name = 'user_likes' then
    update public.stories set like_count = greatest(0, like_count + delta) where id = target_story;
  else
    update public.stories set bookmark_count = greatest(0, bookmark_count + delta) where id = target_story;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists user_likes_adjust_story_count on public.user_likes;
create trigger user_likes_adjust_story_count after insert or delete on public.user_likes
  for each row execute procedure public.adjust_story_reaction_count();
drop trigger if exists user_bookmarks_adjust_story_count on public.user_bookmarks;
create trigger user_bookmarks_adjust_story_count after insert or delete on public.user_bookmarks
  for each row execute procedure public.adjust_story_reaction_count();

create or replace function public.create_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.donation is null then
    insert into public.writer_notifications(kind, story_id, chapter_id, message, created_at)
    values ('comment', new.story_id, new.chapter_id, new.author || ' แสดงความคิดเห็น', new.created_at);
  end if;
  return new;
end;
$$;
drop trigger if exists comment_notification on public.comments;
create trigger comment_notification after insert on public.comments
  for each row execute procedure public.create_comment_notification();

create or replace function public.create_aksara_comment(
  p_id text,
  p_story_id text,
  p_chapter_id text,
  p_text text,
  p_is_sticker boolean,
  p_sticker jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles%rowtype;
begin
  select * into profile_row from public.profiles where id = (select auth.uid());
  if profile_row.id is null then raise exception 'Sign in is required'; end if;
  if not exists (
    select 1 from public.chapters c
    join public.stories s on s.id = c.story_id
    where c.id = p_chapter_id and c.story_id = p_story_id
      and c.status = 'published' and s.status = 'published'
  ) then raise exception 'Chapter is not available'; end if;

  insert into public.comments(id, story_id, chapter_id, author_id, author, avatar_color, avatar_url, is_vip, text, is_sticker, sticker, created_at)
  values (
    p_id, p_story_id, p_chapter_id, profile_row.id, profile_row.display_name, '#E07A5F',
    profile_row.avatar_url, profile_row.is_vip, left(p_text, 2000), p_is_sticker,
    p_sticker, (extract(epoch from clock_timestamp()) * 1000)::bigint
  );
end;
$$;

create or replace function public.create_tip_records(
  p_id text,
  p_story_id text,
  p_chapter_id text,
  p_amount integer,
  p_label text,
  p_sticker_id text,
  p_sticker_emoji text,
  p_payment_method text,
  p_message text,
  p_comment_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles%rowtype;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  select * into profile_row from public.profiles where id = (select auth.uid());
  if profile_row.id is null then raise exception 'Sign in is required'; end if;
  if not exists (
    select 1 from public.chapters c
    join public.stories s on s.id = c.story_id
    where c.id = p_chapter_id and c.story_id = p_story_id
      and c.status = 'published' and s.status = 'published'
  ) then raise exception 'Chapter is not available'; end if;

  insert into public.tips(id, story_id, chapter_id, donor_id, donor, amount, label, sticker_id, sticker_emoji, payment_method, created_at)
  values (p_id, p_story_id, p_chapter_id, profile_row.id, profile_row.display_name, p_amount, p_label, p_sticker_id, p_sticker_emoji, p_payment_method, now_ms);

  insert into public.comments(id, story_id, chapter_id, author_id, author, avatar_color, avatar_url, is_vip, text, is_sticker, donation, created_at)
  values (
    p_comment_id, p_story_id, p_chapter_id, profile_row.id, profile_row.display_name, '#E07A5F',
    profile_row.avatar_url, profile_row.is_vip, p_message, false,
    jsonb_build_object('stickerId', p_sticker_id, 'stickerEmoji', p_sticker_emoji, 'label', p_label, 'amount', p_amount, 'paymentMethod', p_payment_method),
    now_ms
  );

  insert into public.writer_notifications(kind, story_id, chapter_id, message, created_at)
  values ('donation', p_story_id, p_chapter_id, profile_row.display_name || ' ส่ง ' || p_label || ' มูลค่า ฿' || p_amount, now_ms);
end;
$$;

create or replace function public.create_like_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  liker_name text;
begin
  select display_name into liker_name from public.profiles where id = new.user_id;
  insert into public.writer_notifications(kind, story_id, message, created_at)
  values ('like', new.story_id, coalesce(liker_name, 'นักอ่าน') || ' กดถูกใจนิยาย', (extract(epoch from clock_timestamp()) * 1000)::bigint);
  return new;
end;
$$;
drop trigger if exists like_notification on public.user_likes;
create trigger like_notification after insert on public.user_likes
  for each row execute procedure public.create_like_notification();

create or replace function public.record_vip_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_vip and not old.is_vip then
    insert into public.vip_subscriptions(id, user_id, created_at)
    values (gen_random_uuid()::text, new.id, (extract(epoch from clock_timestamp()) * 1000)::bigint);
    insert into public.writer_notifications(kind, message, created_at)
    values ('vip', new.display_name || ' สมัครสมาชิก VIP รายเดือน', (extract(epoch from clock_timestamp()) * 1000)::bigint);
  end if;
  return new;
end;
$$;
drop trigger if exists profile_vip_activation on public.profiles;
create trigger profile_vip_activation after update of is_vip on public.profiles
  for each row execute procedure public.record_vip_activation();

create or replace function public.record_vip_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles%rowtype;
  charge_amount numeric(10, 2);
begin
  select * into profile_row
  from public.profiles
  where id = new.user_id
  for update;

  charge_amount := case when profile_row.has_next_month_discount then 47.20 else 59.00 end;
  update public.profiles
  set coins = coins + 5,
      has_next_month_discount = false,
      updated_at = now()
  where id = new.user_id;

  insert into public.transactions(user_id, type, amount, coins, status, details, source_type, source_id)
  values (
    new.user_id,
    'vip_subscription',
    charge_amount,
    5,
    'completed',
    jsonb_build_object(
      'description', 'สมัครหรือต่ออายุสมาชิก VIP',
      'coin_bonus', 5,
      'discount_applied', profile_row.has_next_month_discount,
      'discount_percent', case when profile_row.has_next_month_discount then 20 else 0 end
    ),
    'vip_subscription',
    new.id
  )
  on conflict (source_type, source_id) do nothing;
  return new;
end;
$$;
drop trigger if exists vip_subscription_transaction on public.vip_subscriptions;
create trigger vip_subscription_transaction after insert on public.vip_subscriptions
  for each row execute procedure public.record_vip_transaction();

create or replace function public.record_tip_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  story_title text;
  vip_member boolean := false;
  earned_coins integer := 0;
  transaction_status text;
begin
  select title into story_title from public.stories where id = new.story_id;
  transaction_status := case when new.payment_status = 'paid' then 'completed' else 'pending' end;

  if new.payment_status = 'paid' and not new.coins_rewarded
      and (tg_op = 'INSERT' or old.payment_status <> 'paid') then
    select is_vip into vip_member from public.profiles where id = new.donor_id for update;
    if coalesce(vip_member, false) then
      earned_coins := floor(new.amount / 10.0)::integer;
      update public.profiles
      set coins = coins + earned_coins, updated_at = now()
      where id = new.donor_id;
      update public.tips set coins_rewarded = true where id = new.id;
    end if;
  end if;

  insert into public.transactions as existing_transaction(user_id, type, amount, coins, status, details, source_type, source_id)
  values (
    new.donor_id,
    'donation',
    new.amount,
    earned_coins,
    transaction_status,
    jsonb_build_object(
      'label', new.label,
      'story_title', coalesce(story_title, ''),
      'payment_method', new.payment_method
    ),
    'tip',
    new.id
  )
  on conflict (source_type, source_id) do update
  set amount = excluded.amount,
      coins = greatest(existing_transaction.coins, excluded.coins),
      status = excluded.status,
      details = excluded.details;
  return new;
end;
$$;
drop trigger if exists tip_transaction on public.tips;
create trigger tip_transaction after insert or update of payment_status on public.tips
  for each row execute procedure public.record_tip_transaction();

insert into public.transactions(user_id, type, amount, coins, status, details, source_type, source_id, created_at)
select
  subscription.user_id,
  'vip_subscription',
  59.00,
  0,
  'completed',
  jsonb_build_object('description', 'ประวัติสมาชิก VIP ก่อนเปิดใช้ Coins'),
  'vip_subscription',
  subscription.id,
  to_timestamp(subscription.created_at / 1000.0)
from public.vip_subscriptions subscription
on conflict (source_type, source_id) do nothing;

insert into public.transactions(user_id, type, amount, coins, status, details, source_type, source_id, created_at)
select
  tip.donor_id,
  'donation',
  tip.amount,
  0,
  case when tip.payment_status = 'paid' then 'completed' else 'pending' end,
  jsonb_build_object(
    'label', tip.label,
    'story_title', coalesce(story.title, ''),
    'payment_method', tip.payment_method
  ),
  'tip',
  tip.id,
  to_timestamp(tip.created_at / 1000.0)
from public.tips tip
left join public.stories story on story.id = tip.story_id
on conflict (source_type, source_id) do nothing;

create or replace function public.redeem_vip_discount()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles%rowtype;
  redemption_id text := gen_random_uuid()::text;
begin
  select * into profile_row
  from public.profiles
  where id = (select auth.uid())
  for update;
  if profile_row.id is null then raise exception 'Sign in is required'; end if;
  if not profile_row.is_vip then raise exception 'VIP membership is required to redeem coins'; end if;
  if profile_row.coins < 100 then raise exception 'At least 100 coins are required'; end if;
  if profile_row.has_next_month_discount then raise exception 'A discount is already reserved for next month'; end if;

  update public.profiles
  set coins = coins - 100, has_next_month_discount = true, updated_at = now()
  where id = profile_row.id;

  insert into public.transactions(user_id, type, amount, coins, status, details, source_type, source_id)
  values (
    profile_row.id,
    'coin_redemption',
    0,
    -100,
    'completed',
    jsonb_build_object('description', 'ส่วนลดค่าสมาชิก VIP 20% สำหรับรอบบิลเดือนถัดไป'),
    'coin_redemption',
    redemption_id
  );
end;
$$;

create or replace function public.reset_aksara_statistics()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_writer() then raise exception 'Writer access required'; end if;
  delete from public.view_events;
  update public.stories set read_count = 0;
  update public.chapters set read_count = 0;
end;
$$;

create or replace function public.reorder_aksara_chapters(p_story_id text, p_chapter_ids text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  chapter_count integer;
begin
  if not public.is_writer() then raise exception 'Writer access required'; end if;
  select count(*) into chapter_count from public.chapters where story_id = p_story_id;
  if chapter_count <> coalesce(array_length(p_chapter_ids, 1), 0)
    or chapter_count <> (select count(distinct requested.id) from unnest(p_chapter_ids) as requested(id))
    or exists (
      select 1 from unnest(p_chapter_ids) as requested(id)
      where not exists (select 1 from public.chapters c where c.id = requested.id and c.story_id = p_story_id)
    ) then
    raise exception 'Chapter list does not match the story';
  end if;

  update public.chapters set number = -number where story_id = p_story_id;
  update public.chapters c
    set number = requested.position::integer
    from unnest(p_chapter_ids) with ordinality as requested(id, position)
    where c.story_id = p_story_id and c.id = requested.id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_contents enable row level security;
alter table public.comments enable row level security;
alter table public.tips enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_likes enable row level security;
alter table public.reading_progress enable row level security;
alter table public.vip_subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.writer_notifications enable row level security;
alter table public.view_events enable row level security;
alter table public.legacy_migrations enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check (
  id = (select auth.uid())
  and role = 'reader'
  and is_vip = false
  and coins = 0
  and has_next_month_discount = false
);
revoke update on public.profiles from anon, authenticated;
grant update (display_name, bio, avatar_url, auto_renew, reading_theme, font_family, font_size, updated_at) on public.profiles to authenticated;
drop policy if exists "Users update safe profile fields" on public.profiles;
create policy "Users update safe profile fields" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "Published stories are public" on public.stories;
create policy "Published stories are public" on public.stories for select to anon, authenticated using (status = 'published' or author_id = (select auth.uid()) or public.is_writer());
drop policy if exists "Only writer can insert stories" on public.stories;
create policy "Only writer can insert stories" on public.stories for insert to authenticated with check (public.is_writer() and author_id = (select auth.uid()));
drop policy if exists "Only writer can update stories" on public.stories;
create policy "Only writer can update stories" on public.stories for update to authenticated using (public.is_writer() and author_id = (select auth.uid())) with check (public.is_writer() and author_id = (select auth.uid()));
drop policy if exists "Only writer can delete stories" on public.stories;
create policy "Only writer can delete stories" on public.stories for delete to authenticated using (public.is_writer() and author_id = (select auth.uid()));

drop policy if exists "Published chapters are public" on public.chapters;
create policy "Published chapters are public" on public.chapters for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.stories s where s.id = story_id and s.status = 'published')
  or public.is_writer()
);
drop policy if exists "Only writer can write chapters" on public.chapters;
create policy "Only writer can write chapters" on public.chapters for all to authenticated
  using (public.is_writer()) with check (public.is_writer());

drop policy if exists "Accessible chapter text is visible" on public.chapter_contents;
create policy "Accessible chapter text is visible" on public.chapter_contents for select to anon, authenticated using (
  exists (
    select 1 from public.chapters c
    join public.stories s on s.id = c.story_id
    where c.id = public.chapter_contents.chapter_id
      and c.story_id = public.chapter_contents.story_id
      and (
        public.is_writer()
        or (
          c.status = 'published' and s.status = 'published'
          and (
            c.access = 'free'
            or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_vip)
          )
        )
      )
  )
);
drop policy if exists "Only writer can write chapter text" on public.chapter_contents;
create policy "Only writer can write chapter text" on public.chapter_contents for all to authenticated
  using (public.is_writer()) with check (public.is_writer());

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can add own comments" on public.comments;
drop policy if exists "Authors and writer can delete comments" on public.comments;
create policy "Authors and writer can delete comments" on public.comments for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_writer());

drop policy if exists "Tips are public" on public.tips;
create policy "Tips are public" on public.tips for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can send tips" on public.tips;
drop policy if exists "Users manage own bookmarks" on public.user_bookmarks;
create policy "Users manage own bookmarks" on public.user_bookmarks for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Users manage own likes" on public.user_likes;
create policy "Users manage own likes" on public.user_likes for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Users manage own reading progress" on public.reading_progress;
create policy "Users manage own reading progress" on public.reading_progress for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Users read own VIP subscriptions" on public.vip_subscriptions;
create policy "Users read own VIP subscriptions" on public.vip_subscriptions for select to authenticated using (user_id = (select auth.uid()) or public.is_writer());
drop policy if exists "Users read own transactions" on public.transactions;
create policy "Users read own transactions" on public.transactions for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Writer reads notifications" on public.writer_notifications;
create policy "Writer reads notifications" on public.writer_notifications for select to authenticated using (public.is_writer());
drop policy if exists "No direct view event access" on public.view_events;
create policy "No direct view event access" on public.view_events for select to authenticated using (public.is_writer());
drop policy if exists "Writer manages own legacy migration marker" on public.legacy_migrations;
create policy "Writer manages own legacy migration marker" on public.legacy_migrations for all to authenticated
  using (user_id = (select auth.uid()) and public.is_writer())
  with check (user_id = (select auth.uid()) and public.is_writer());

revoke all on public.profiles, public.stories, public.chapters, public.chapter_contents,
  public.comments, public.tips, public.user_bookmarks, public.user_likes,
  public.reading_progress, public.vip_subscriptions, public.transactions, public.writer_notifications,
  public.view_events, public.legacy_migrations from anon, authenticated;
revoke all on storage.objects from anon, authenticated;
grant select (id, title, status, tags, category, horizontal_cover_url, read_count, like_count, bookmark_count, data, created_at, updated_at)
  on public.stories to anon, authenticated;
grant select on public.chapters, public.chapter_contents, public.comments to anon, authenticated;
grant select (id, story_id, chapter_id, donor, amount, label, sticker_id, sticker_emoji, payment_method, payment_status, created_at)
  on public.tips to anon, authenticated;
grant delete on public.comments to authenticated;
grant select, insert, delete on public.user_bookmarks, public.user_likes to authenticated;
grant select, insert, update, delete on public.reading_progress to authenticated;
grant select, insert on public.profiles to authenticated;
grant update (display_name, bio, avatar_url, auto_renew, reading_theme, font_family, font_size, updated_at)
  on public.profiles to authenticated;
grant select on public.vip_subscriptions, public.writer_notifications to authenticated;
grant select on public.transactions to authenticated;
grant select, insert, update on public.legacy_migrations to authenticated;
grant insert, update, delete on public.stories, public.chapters, public.chapter_contents to authenticated;
grant select on public.view_events to authenticated;
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;
grant execute on function public.record_story_view(text, uuid) to anon, authenticated;
grant execute on function public.record_chapter_view(text, text, uuid) to anon, authenticated;
grant execute on function public.create_aksara_comment(text, text, text, text, boolean, jsonb) to authenticated;
grant execute on function public.create_tip_records(text, text, text, integer, text, text, text, text, text, text) to authenticated;
grant execute on function public.is_writer() to anon, authenticated;
grant execute on function public.reset_aksara_statistics() to authenticated;
grant execute on function public.reorder_aksara_chapters(text, text[]) to authenticated;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function public.create_comment_notification() from public, anon, authenticated;
revoke all on function public.create_like_notification() from public, anon, authenticated;
revoke all on function public.record_vip_activation() from public, anon, authenticated;
revoke all on function public.record_vip_transaction() from public, anon, authenticated;
revoke all on function public.record_tip_transaction() from public, anon, authenticated;
revoke all on function public.redeem_vip_discount() from public, anon;
revoke all on function public.adjust_story_reaction_count() from public, anon, authenticated;
revoke all on function public.create_aksara_comment(text, text, text, text, boolean, jsonb) from public, anon;
revoke all on function public.create_tip_records(text, text, text, integer, text, text, text, text, text, text) from public, anon;
revoke all on function public.reset_aksara_statistics() from public, anon;
revoke all on function public.reorder_aksara_chapters(text, text[]) from public, anon;
grant execute on function public.create_aksara_comment(text, text, text, text, boolean, jsonb) to authenticated;
grant execute on function public.create_tip_records(text, text, text, integer, text, text, text, text, text, text) to authenticated;
grant execute on function public.reset_aksara_statistics() to authenticated;
grant execute on function public.reorder_aksara_chapters(text, text[]) to authenticated;
grant execute on function public.redeem_vip_discount() to authenticated;

-- Keep profile-private settings and writer notifications synchronized between devices.
do $$
begin
  alter publication supabase_realtime add table public.user_bookmarks;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chapter_contents;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.user_likes;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.reading_progress;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.writer_notifications;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.transactions;
exception when duplicate_object then null;
end $$;

-- Enable realtime for data displayed by all clients.
do $$
begin
  alter publication supabase_realtime add table public.stories;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chapters;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.tips;
exception when duplicate_object then null;
end $$;

-- After registering the writer account, replace the UUID below with its auth.users id:
-- update public.profiles set role = 'writer' where id = 'YOUR_WRITER_AUTH_USER_UUID';
-- Set VIP only after a trusted payment flow/admin verification:
-- update public.profiles set is_vip = true where id = 'YOUR_VIP_AUTH_USER_UUID';
-- To record a verified renewal while VIP is already enabled, insert a row into
-- public.vip_subscriptions from a trusted backend; the trigger awards Coins and logs the charge.
-- Only mark a donation paid after a trusted server-side payment webhook verifies it:
-- update public.tips set payment_status = 'paid' where id = 'VERIFIED_TIP_ID';
