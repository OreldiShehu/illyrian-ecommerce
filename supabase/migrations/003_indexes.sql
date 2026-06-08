-- =============================================
-- ZAZA'S E-COMMERCE — Performance Indexes
-- Migration 003
-- =============================================

-- Vendors
create index if not exists idx_vendors_slug on public.vendors (slug);
create index if not exists idx_vendors_user_id on public.vendors (user_id);
create index if not exists idx_vendors_status on public.vendors (status);
create index if not exists idx_vendors_city on public.vendors (city);
create index if not exists idx_vendors_category on public.vendors (category);
create index if not exists idx_vendors_is_active on public.vendors (is_active);

-- Products
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_vendor_id on public.products (vendor_id);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_products_is_featured on public.products (is_featured);
create index if not exists idx_products_price on public.products (price);
create index if not exists idx_products_stock on public.products (stock);

-- Orders
create index if not exists idx_orders_customer_id on public.orders (customer_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- Order items
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_vendor_id on public.order_items (vendor_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- Reviews
create index if not exists idx_reviews_product_id on public.reviews (product_id);
create index if not exists idx_reviews_customer_id on public.reviews (customer_id);

-- Vendor reviews
create index if not exists idx_vendor_reviews_vendor_id on public.vendor_reviews (vendor_id);

-- Wishlists
create index if not exists idx_wishlists_user_id on public.wishlists (user_id);

-- Notifications
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_read on public.notifications (read);

-- Loyalty points
create index if not exists idx_loyalty_points_user_id on public.loyalty_points (user_id);

-- Commission ledger
create index if not exists idx_commission_ledger_vendor_id on public.commission_ledger (vendor_id);
create index if not exists idx_commission_ledger_status on public.commission_ledger (status);
create index if not exists idx_commission_ledger_due_date on public.commission_ledger (due_date);

-- Flash sales
create index if not exists idx_flash_sales_product_id on public.flash_sales (product_id);
create index if not exists idx_flash_sales_vendor_id on public.flash_sales (vendor_id);
create index if not exists idx_flash_sales_is_active on public.flash_sales (is_active);
create index if not exists idx_flash_sales_ends_at on public.flash_sales (ends_at);

-- Vendor plans
create index if not exists idx_vendor_plans_vendor_id on public.vendor_plans (vendor_id);

-- Featured slots
create index if not exists idx_featured_slots_vendor_id on public.featured_slots (vendor_id);
create index if not exists idx_featured_slots_slot_type on public.featured_slots (slot_type);
create index if not exists idx_featured_slots_ends_at on public.featured_slots (ends_at);

-- Coupons
create index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupons_is_active on public.coupons (is_active);
