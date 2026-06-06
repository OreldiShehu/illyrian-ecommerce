'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCustomerWelcome, sendVendorWelcome } from '@/lib/resend'
import type { ActionResult } from '@/types'

export async function signUp(formData: FormData): Promise<ActionResult<{ role: string }>> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const role = (formData.get('role') as string) || 'customer'

  if (!name || !email || !password) {
    return { success: false, error: 'Të gjitha fushat janë të detyrueshme.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Fjalëkalimet nuk përputhen.' }
  }

  if (password.length < 8) {
    return { success: false, error: 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.' }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Ky email është tashmë i regjistruar.' }
    }
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Regjistrimi dështoi. Provoni përsëri.' }
  }

  // Ensure user row exists (trigger handles this, but upsert for safety)
  const admin = createAdminClient()
  await admin.from('users').upsert({
    id: authData.user.id,
    email,
    name,
    phone: phone || null,
    role: role as 'customer' | 'vendor' | 'admin',
  })

  // Send welcome email
  try {
    if (role === 'vendor') {
      await sendVendorWelcome(email, name)
    } else {
      await sendCustomerWelcome(email, name)
    }
  } catch {
    // Email failure should not block registration
  }

  return { success: true, data: { role } }
}

export async function signIn(formData: FormData): Promise<ActionResult<{ role: string; vendorStatus?: string }>> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email dhe fjalëkalimi janë të detyrueshëm.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'Email ose fjalëkalim i gabuar.' }
    }
    return { success: false, error: error.message }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = userData?.role ?? 'customer'
  let vendorStatus: string | undefined

  if (role === 'vendor') {
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('status')
      .eq('user_id', data.user.id)
      .single()
    vendorStatus = vendorData?.status
  }

  revalidatePath('/', 'layout')
  return { success: true, data: { role, vendorStatus } }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const avatarUrl = formData.get('avatar_url') as string | null

  const { error } = await supabase
    .from('users')
    .update({
      name,
      phone: phone || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/account')
  return { success: true }
}
