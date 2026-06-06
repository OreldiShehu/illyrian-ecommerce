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
