import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('flash_sales')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('ends_at', now)
    .select('id, product_id')

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ expired: data?.length ?? 0, timestamp: now }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
