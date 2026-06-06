-- =============================================
-- ZAZA'S E-COMMERCE — Initial Schema
-- Migration 001
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS
-- =============================================
create table public.users (
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
create table public.vendors (
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
  status text check (status in ('pending','approved','rejected')) default 'pending' not null,
  commission_rate numeric default 12 not null,
  bank_name text,
  iban text,
  account_holder text,
  created_at timestamptz default now() not null
);

-- =============================================
-- PRODUCTS
-- =============================================
create table public.products (
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
create table public.orders (
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
create table public.order_items (
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
create table public.reviews (
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
create table public.vendor_reviews (
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
create table public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, product_id)
);

-- =============================================
-- COUPONS
-- =============================================
create table public.coupons (
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
create table public.vendor_plans (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors on delete cascade not null,
  plan text check (plan in ('free','pro')) default 'free' not null,
  started_at timestamptz default now(),
  created_at timestamptz default now() not null
);

-- =============================================
-- FEATURED SLOTS
-- =============================================
create table public.featured_slots (
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
create table public.notifications (
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
create table public.loyalty_points (
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
create table public.commission_ledger (
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
create table public.email_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- REFERRALS
-- =============================================
create table public.referrals (
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
create table public.referral_credits (
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
create table public.flash_sales (
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- =============================================
-- ZAZA'S E-COMMERCE — Row Level Security
-- Migration 002
-- =============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.vendor_plans enable row level security;
alter table public.featured_slots enable row level security;
alter table public.notifications enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.email_subscribers enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_credits enable row level security;
alter table public.flash_sales enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: check if current user is vendor
create or replace function public.is_vendor()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'vendor'
  );
$$;

-- Helper: get vendor_id for current user
create or replace function public.my_vendor_id()
returns uuid
language sql
security definer
stable
as $$
  select id from public.vendors where user_id = auth.uid() limit 1;
$$;

-- =============================================
-- USERS POLICIES
-- =============================================
create policy "users_select_own" on public.users
  for select using (auth.uid() = id or public.is_admin());

create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id or public.is_admin());

-- =============================================
-- VENDORS POLICIES
-- =============================================
-- Public: anyone can read active/approved vendors
create policy "vendors_public_select" on public.vendors
  for select using (
    (is_active = true and status = 'approved')
    or user_id = auth.uid()
    or public.is_admin()
  );

create policy "vendors_insert_own" on public.vendors
  for insert with check (user_id = auth.uid() or public.is_admin());

create policy "vendors_update_own" on public.vendors
  for update using (user_id = auth.uid() or public.is_admin());

create policy "vendors_delete_admin" on public.vendors
  for delete using (public.is_admin());

-- =============================================
-- PRODUCTS POLICIES
-- =============================================
-- Public: anyone can read active products from active vendors
create policy "products_public_select" on public.products
  for select using (
    (is_active = true and exists (
      select 1 from public.vendors
      where vendors.id = products.vendor_id
        and vendors.is_active = true
        and vendors.status = 'approved'
    ))
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

create policy "products_vendor_insert" on public.products
  for insert with check (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "products_vendor_update" on public.products
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "products_vendor_delete" on public.products
  for delete using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

-- =============================================
-- ORDERS POLICIES
-- =============================================
create policy "orders_customer_select" on public.orders
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = orders.id
        and oi.vendor_id = public.my_vendor_id()
    )
    or public.is_admin()
  );

create policy "orders_customer_insert" on public.orders
  for insert with check (customer_id = auth.uid() or public.is_admin());

create policy "orders_update" on public.orders
  for update using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = orders.id
        and oi.vendor_id = public.my_vendor_id()
    )
    or public.is_admin()
  );

-- =============================================
-- ORDER ITEMS POLICIES
-- =============================================
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );

-- =============================================
-- REVIEWS POLICIES
-- =============================================
create policy "reviews_public_select" on public.reviews
  for select using (true);

create policy "reviews_customer_insert" on public.reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.customer_id = auth.uid()
        and oi.product_id = reviews.product_id
        and o.status = 'delivered'
    )
  );

create policy "reviews_customer_update" on public.reviews
  for update using (customer_id = auth.uid() or public.is_admin());

create policy "reviews_admin_delete" on public.reviews
  for delete using (public.is_admin());

-- =============================================
-- VENDOR REVIEWS POLICIES
-- =============================================
create policy "vendor_reviews_public_select" on public.vendor_reviews
  for select using (true);

create policy "vendor_reviews_customer_insert" on public.vendor_reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.customer_id = auth.uid()
        and oi.vendor_id = vendor_reviews.vendor_id
        and o.status = 'delivered'
    )
  );

-- =============================================
-- WISHLISTS POLICIES
-- =============================================
create policy "wishlists_own" on public.wishlists
  for all using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- COUPONS POLICIES
-- =============================================
create policy "coupons_public_select" on public.coupons
  for select using (is_active = true or public.is_admin());

create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin());

-- =============================================
-- VENDOR PLANS POLICIES
-- =============================================
create policy "vendor_plans_select" on public.vendor_plans
  for select using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "vendor_plans_admin_all" on public.vendor_plans
  for all using (public.is_admin());

-- =============================================
-- FEATURED SLOTS POLICIES
-- =============================================
create policy "featured_slots_public_select" on public.featured_slots
  for select using (
    (is_paid = true and ends_at > now())
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

create policy "featured_slots_admin_all" on public.featured_slots
  for all using (public.is_admin());

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- LOYALTY POINTS POLICIES
-- =============================================
create policy "loyalty_points_own" on public.loyalty_points
  for select using (user_id = auth.uid() or public.is_admin());

create policy "loyalty_points_system_insert" on public.loyalty_points
  for insert with check (public.is_admin() or auth.uid() is not null);

-- =============================================
-- COMMISSION LEDGER POLICIES
-- =============================================
create policy "commission_vendor_select" on public.commission_ledger
  for select using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "commission_vendor_update" on public.commission_ledger
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "commission_admin_all" on public.commission_ledger
  for all using (public.is_admin());

-- =============================================
-- EMAIL SUBSCRIBERS POLICIES
-- =============================================
create policy "email_subscribers_insert" on public.email_subscribers
  for insert with check (true);

create policy "email_subscribers_admin_select" on public.email_subscribers
  for select using (public.is_admin());

-- =============================================
-- REFERRALS POLICIES
-- =============================================
create policy "referrals_own" on public.referrals
  for select using (
    referrer_id = auth.uid() or referee_id = auth.uid() or public.is_admin()
  );

create policy "referrals_insert" on public.referrals
  for insert with check (referee_id = auth.uid() or public.is_admin());

-- =============================================
-- REFERRAL CREDITS POLICIES
-- =============================================
create policy "referral_credits_own" on public.referral_credits
  for select using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- FLASH SALES POLICIES
-- =============================================
create policy "flash_sales_public_select" on public.flash_sales
  for select using (
    (is_active = true and ends_at > now())
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

create policy "flash_sales_vendor_insert" on public.flash_sales
  for insert with check (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "flash_sales_vendor_update" on public.flash_sales
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

create policy "flash_sales_admin_delete" on public.flash_sales
  for delete using (public.is_admin());
-- =============================================
-- ZAZA'S E-COMMERCE — Performance Indexes
-- Migration 003
-- =============================================

-- Vendors
create index idx_vendors_slug on public.vendors (slug);
create index idx_vendors_user_id on public.vendors (user_id);
create index idx_vendors_status on public.vendors (status);
create index idx_vendors_city on public.vendors (city);
create index idx_vendors_category on public.vendors (category);
create index idx_vendors_is_active on public.vendors (is_active);

-- Products
create index idx_products_slug on public.products (slug);
create index idx_products_vendor_id on public.products (vendor_id);
create index idx_products_category on public.products (category);
create index idx_products_is_active on public.products (is_active);
create index idx_products_is_featured on public.products (is_featured);
create index idx_products_price on public.products (price);
create index idx_products_stock on public.products (stock);

-- Orders
create index idx_orders_customer_id on public.orders (customer_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_created_at on public.orders (created_at desc);

-- Order items
create index idx_order_items_order_id on public.order_items (order_id);
create index idx_order_items_vendor_id on public.order_items (vendor_id);
create index idx_order_items_product_id on public.order_items (product_id);

-- Reviews
create index idx_reviews_product_id on public.reviews (product_id);
create index idx_reviews_customer_id on public.reviews (customer_id);

-- Vendor reviews
create index idx_vendor_reviews_vendor_id on public.vendor_reviews (vendor_id);

-- Wishlists
create index idx_wishlists_user_id on public.wishlists (user_id);

-- Notifications
create index idx_notifications_user_id on public.notifications (user_id);
create index idx_notifications_read on public.notifications (read);

-- Loyalty points
create index idx_loyalty_points_user_id on public.loyalty_points (user_id);

-- Commission ledger
create index idx_commission_ledger_vendor_id on public.commission_ledger (vendor_id);
create index idx_commission_ledger_status on public.commission_ledger (status);
create index idx_commission_ledger_due_date on public.commission_ledger (due_date);

-- Flash sales
create index idx_flash_sales_product_id on public.flash_sales (product_id);
create index idx_flash_sales_vendor_id on public.flash_sales (vendor_id);
create index idx_flash_sales_is_active on public.flash_sales (is_active);
create index idx_flash_sales_ends_at on public.flash_sales (ends_at);

-- Vendor plans
create index idx_vendor_plans_vendor_id on public.vendor_plans (vendor_id);

-- Featured slots
create index idx_featured_slots_vendor_id on public.featured_slots (vendor_id);
create index idx_featured_slots_slot_type on public.featured_slots (slot_type);
create index idx_featured_slots_ends_at on public.featured_slots (ends_at);

-- Coupons
create index idx_coupons_code on public.coupons (code);
create index idx_coupons_is_active on public.coupons (is_active);
-- RPC: atomically decrement stock, fail if insufficient
-- RPC parameter names must match what the client passes
CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock - amount
  WHERE id = product_id AND stock >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int) TO service_role;
-- Add received and overdue to commission_ledger status enum
ALTER TABLE public.commission_ledger
  DROP CONSTRAINT IF EXISTS commission_ledger_status_check;

ALTER TABLE public.commission_ledger
  ADD CONSTRAINT commission_ledger_status_check
  CHECK (status IN ('pending', 'paid', 'received', 'overdue'));

-- Add paid_at timestamp if not present
ALTER TABLE public.commission_ledger
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add amount alias column for easier querying (mirrors amount_owed)
-- We use amount_owed as canonical; clients should query amount_owed
-- Add flash_sales discount_percentage column if schema used discount_percent
ALTER TABLE public.flash_sales
  ADD COLUMN IF NOT EXISTS discount_percentage numeric
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Backfill from discount_percent if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='flash_sales' AND column_name='discount_percent') THEN
    UPDATE public.flash_sales SET discount_percentage = discount_percent WHERE discount_percentage IS NULL;
  END IF;
END $$;
-- Update featured_slots to support product-based slots with slot_position
ALTER TABLE public.featured_slots
  ADD COLUMN IF NOT EXISTS slot_position integer,
  ADD COLUMN IF NOT EXISTS product_id uuid references public.products on delete set null,
  ADD COLUMN IF NOT EXISTS is_active boolean default true not null;

-- Drop old slot_type constraint to allow flexible use
ALTER TABLE public.featured_slots
  ALTER COLUMN slot_type DROP NOT NULL;

-- Also update vendors status to allow 'active' (previously schema used 'approved')
ALTER TABLE public.vendors
  DROP CONSTRAINT IF EXISTS vendors_status_check;

ALTER TABLE public.vendors
  ADD CONSTRAINT vendors_status_check
  CHECK (status IN ('pending', 'active', 'rejected', 'suspended'));
