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
drop policy if exists "users_select_own" on public.users; create policy "users_select_own" on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "users_insert_self" on public.users; create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users; create policy "users_update_own" on public.users
  for update using (auth.uid() = id or public.is_admin());

-- =============================================
-- VENDORS POLICIES
-- =============================================
-- Public: anyone can read active vendors
drop policy if exists "vendors_public_select" on public.vendors; create policy "vendors_public_select" on public.vendors
  for select using (
    (is_active = true and status = 'active')
    or user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "vendors_insert_own" on public.vendors; create policy "vendors_insert_own" on public.vendors
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "vendors_update_own" on public.vendors; create policy "vendors_update_own" on public.vendors
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists "vendors_delete_admin" on public.vendors; create policy "vendors_delete_admin" on public.vendors
  for delete using (public.is_admin());

-- =============================================
-- PRODUCTS POLICIES
-- =============================================
-- Public: anyone can read active products from active vendors
drop policy if exists "products_public_select" on public.products; create policy "products_public_select" on public.products
  for select using (
    (is_active = true and exists (
      select 1 from public.vendors
      where vendors.id = products.vendor_id
        and vendors.is_active = true
        and vendors.status = 'active'
    ))
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

drop policy if exists "products_vendor_insert" on public.products; create policy "products_vendor_insert" on public.products
  for insert with check (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "products_vendor_update" on public.products; create policy "products_vendor_update" on public.products
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "products_vendor_delete" on public.products; create policy "products_vendor_delete" on public.products
  for delete using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

-- =============================================
-- ORDERS POLICIES
-- =============================================
drop policy if exists "orders_customer_select" on public.orders; create policy "orders_customer_select" on public.orders
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = orders.id
        and oi.vendor_id = public.my_vendor_id()
    )
    or public.is_admin()
  );

drop policy if exists "orders_customer_insert" on public.orders; create policy "orders_customer_insert" on public.orders
  for insert with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "orders_update" on public.orders; create policy "orders_update" on public.orders
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
drop policy if exists "order_items_select" on public.order_items; create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

drop policy if exists "order_items_insert" on public.order_items; create policy "order_items_insert" on public.order_items
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
drop policy if exists "reviews_public_select" on public.reviews; create policy "reviews_public_select" on public.reviews
  for select using (true);

drop policy if exists "reviews_customer_insert" on public.reviews; create policy "reviews_customer_insert" on public.reviews
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

drop policy if exists "reviews_customer_update" on public.reviews; create policy "reviews_customer_update" on public.reviews
  for update using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_admin_delete" on public.reviews; create policy "reviews_admin_delete" on public.reviews
  for delete using (public.is_admin());

-- =============================================
-- VENDOR REVIEWS POLICIES
-- =============================================
drop policy if exists "vendor_reviews_public_select" on public.vendor_reviews; create policy "vendor_reviews_public_select" on public.vendor_reviews
  for select using (true);

drop policy if exists "vendor_reviews_customer_insert" on public.vendor_reviews; create policy "vendor_reviews_customer_insert" on public.vendor_reviews
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
drop policy if exists "wishlists_own" on public.wishlists; create policy "wishlists_own" on public.wishlists
  for all using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- COUPONS POLICIES
-- =============================================
drop policy if exists "coupons_public_select" on public.coupons; create policy "coupons_public_select" on public.coupons
  for select using (is_active = true or public.is_admin());

drop policy if exists "coupons_admin_all" on public.coupons; create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin());

-- =============================================
-- VENDOR PLANS POLICIES
-- =============================================
drop policy if exists "vendor_plans_select" on public.vendor_plans; create policy "vendor_plans_select" on public.vendor_plans
  for select using (true);

drop policy if exists "vendor_plans_admin_all" on public.vendor_plans; create policy "vendor_plans_admin_all" on public.vendor_plans
  for all using (public.is_admin());

-- =============================================
-- FEATURED SLOTS POLICIES
-- =============================================
drop policy if exists "featured_slots_public_select" on public.featured_slots; create policy "featured_slots_public_select" on public.featured_slots
  for select using (
    (is_paid = true and ends_at > now())
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

drop policy if exists "featured_slots_admin_all" on public.featured_slots; create policy "featured_slots_admin_all" on public.featured_slots
  for all using (public.is_admin());

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================
drop policy if exists "notifications_own" on public.notifications; create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- LOYALTY POINTS POLICIES
-- =============================================
drop policy if exists "loyalty_points_own" on public.loyalty_points; create policy "loyalty_points_own" on public.loyalty_points
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "loyalty_points_system_insert" on public.loyalty_points; create policy "loyalty_points_system_insert" on public.loyalty_points
  for insert with check (public.is_admin() or auth.uid() is not null);

-- =============================================
-- COMMISSION LEDGER POLICIES
-- =============================================
drop policy if exists "commission_vendor_select" on public.commission_ledger; create policy "commission_vendor_select" on public.commission_ledger
  for select using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "commission_vendor_update" on public.commission_ledger; create policy "commission_vendor_update" on public.commission_ledger
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "commission_admin_all" on public.commission_ledger; create policy "commission_admin_all" on public.commission_ledger
  for all using (public.is_admin());

-- =============================================
-- EMAIL SUBSCRIBERS POLICIES
-- =============================================
drop policy if exists "email_subscribers_insert" on public.email_subscribers; create policy "email_subscribers_insert" on public.email_subscribers
  for insert with check (true);

drop policy if exists "email_subscribers_admin_select" on public.email_subscribers; create policy "email_subscribers_admin_select" on public.email_subscribers
  for select using (public.is_admin());

-- =============================================
-- REFERRALS POLICIES
-- =============================================
drop policy if exists "referrals_own" on public.referrals; create policy "referrals_own" on public.referrals
  for select using (
    referrer_id = auth.uid() or referee_id = auth.uid() or public.is_admin()
  );

drop policy if exists "referrals_insert" on public.referrals; create policy "referrals_insert" on public.referrals
  for insert with check (referee_id = auth.uid() or public.is_admin());

-- =============================================
-- REFERRAL CREDITS POLICIES
-- =============================================
drop policy if exists "referral_credits_own" on public.referral_credits; create policy "referral_credits_own" on public.referral_credits
  for select using (user_id = auth.uid() or public.is_admin());

-- =============================================
-- FLASH SALES POLICIES
-- =============================================
drop policy if exists "flash_sales_public_select" on public.flash_sales; create policy "flash_sales_public_select" on public.flash_sales
  for select using (
    (is_active = true and ends_at > now())
    or vendor_id = public.my_vendor_id()
    or public.is_admin()
  );

drop policy if exists "flash_sales_vendor_insert" on public.flash_sales; create policy "flash_sales_vendor_insert" on public.flash_sales
  for insert with check (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "flash_sales_vendor_update" on public.flash_sales; create policy "flash_sales_vendor_update" on public.flash_sales
  for update using (
    vendor_id = public.my_vendor_id() or public.is_admin()
  );

drop policy if exists "flash_sales_admin_delete" on public.flash_sales; create policy "flash_sales_admin_delete" on public.flash_sales
  for delete using (public.is_admin());
