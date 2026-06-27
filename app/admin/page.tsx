import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SuperAdminPanel from './super-admin-panel'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'super_admin') redirect('/dashboard')

  // Fetch all notarías for the platform overview
  const { data: notarias } = await supabase.from('notarias').select('*').order('created_at', { ascending:false })

  return <SuperAdminPanel profile={profile} notarias={notarias ?? []} />
}
