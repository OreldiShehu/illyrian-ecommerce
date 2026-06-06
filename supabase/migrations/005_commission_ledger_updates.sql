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
