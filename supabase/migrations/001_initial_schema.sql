-- =============================================
-- ZAZA'S E-COMMERCE — Initial Schema
-- Migration 001
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS
-- =============================================
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  phone text,
  role text check (role in ('customer','vendor','admin')) default 'customer' not null,
  avatar_url text,
  referral_code text unique,
  created_at timestamptz default now() not null
);

-- =============================================
-- VENDORS
-- =============================================
create table if not exists public.vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  store_name text not null,
  slug text unique not null,
  logo_url text,
  banner_url text,
  bio text,
  city text,
  category text,
  whatsapp text,
  is_verified boolean default false not null,
  is_active boolean default false not null,
  status text check (status in ('pending','active','rejected','suspended')) default 'pending' not null,
  commission_rate numeric default 12 not null,
  bank_name text,
  iban text,
  account_holder text,
  created_at timestamptz default now() not null
);

-- =============================================
-- PRODUCTS
-- =============================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null check (price >= 0),
  compare_price numeric check (compare_price >= 0),
  category text,
  subcategory text,
  images text[] default '{}' not null,
  sizes text[] default '{}' not null,
  colors text[] default '{}' not null,
  stock integer default 0 not null check (stock >= 0),
  is_active boolean default true not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- ORDERS
-- =============================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users on delete set null,
  status text check (status in ('pending','confirmed','shipped','delivered','cancelled')) default 'pending' not null,
  total numeric not null check (total >= 0),
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_notes text,
  payment_method text default 'cash_on_delivery' not null,
  cod_collected boolean default false not null,
  coupon_code text,
  coupon_discount numeric default 0 not null,
  loyalty_points_used integer default 0 not null,
  loyalty_discount numeric default 0 not null,
  delivery_fee numeric default 0 not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- ORDER ITEMS
-- =============================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  vendor_id uuid references public.vendors on delete set null,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  price numeric not null check (price >= 0),
  vendor_commission_due numeric,
  created_at timestamptz default now() not null
);

-- =============================================
-- REVIEWS
-- =============================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products on delete cascade not null,
  customer_id uuid references public.users on delete cascade not null,
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now() not null,
  unique (product_id, customer_id)
);

-- =============================================
-- VENDOR REVIEWS
-- =============================================
create table if not exists public.vendor_reviews (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  customer_id uuid references public.users on delete cascade not null,
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now() not null,
  unique (vendor_id, customer_id)
);

-- =============================================
-- WISHLISTS
-- =============================================
create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, product_id)
);

-- =============================================
-- COUPONS
-- =============================================
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text check (discount_type in ('fixed','percent')) not null,
  discount_value numeric not null check (discount_value > 0),
  min_order numeric default 0 not null,
  expires_at timestamptz,
  uses_limit integer,
  uses_count integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- VENDOR PLANS
-- =============================================
create table if not exists public.vendor_plans (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  plan text check (plan in ('free','pro')) default 'free' not null,
  started_at timestamptz default now(),
  created_at timestamptz default now() not null
);

-- =============================================
-- FEATURED SLOTS
-- =============================================
create table if not exists public.featured_slots (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  slot_type text check (slot_type in ('homepage','category','top')) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_paid boolean default false not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- NOTIFICATIONS
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  type text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- LOYALTY POINTS
-- =============================================
create table if not exists public.loyalty_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  points integer not null,
  reason text not null,
  order_id uuid references public.orders on delete set null,
  created_at timestamptz default now() not null
);

-- =============================================
-- COMMISSION LEDGER
-- =============================================
create table if not exists public.commission_ledger (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  order_id uuid references public.orders on delete set null,
  amount_owed numeric not null check (amount_owed >= 0),
  amount_paid numeric default 0 not null,
  status text check (status in ('pending','paid')) default 'pending' not null,
  due_date timestamptz,
  paid_at timestamptz,
  payment_note text,
  payment_method text,
  created_at timestamptz default now() not null
);

-- =============================================
-- EMAIL SUBSCRIBERS
-- =============================================
create table if not exists public.email_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- REFERRALS
-- =============================================
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references public.users on delete cascade not null,
  referee_id uuid references public.users on delete cascade not null,
  status text check (status in ('pending','completed')) default 'pending' not null,
  created_at timestamptz default now() not null,
  unique (referrer_id, referee_id)
);

-- =============================================
-- REFERRAL CREDITS
-- =============================================
create table if not exists public.referral_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  amount numeric not null check (amount > 0),
  reason text not null,
  order_id uuid references public.orders on delete set null,
  created_at timestamptz default now() not null
);

-- =============================================
-- FLASH SALES
-- =============================================
create table if not exists public.flash_sales (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  discount_percent numeric not null check (discount_percent >= 15),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  constraint flash_sale_max_duration check (
    extract(epoch from (ends_at - starts_at)) <= 14400
  )
);

-- =============================================
-- TRIGGER: auto-create user profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
