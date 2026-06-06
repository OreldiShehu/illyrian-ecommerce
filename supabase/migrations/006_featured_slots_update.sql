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
