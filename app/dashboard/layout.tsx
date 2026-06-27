import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Super admin goes to their own panel
  if (profile.role === 'super_admin') redirect('/admin')

  const { data: notaria } = profile.notaria_id
    ? await supabase.from('notarias').select('*').eq('id', profile.notaria_id).single()
    : { data: null }

  return (
    <DashboardShell profile={profile} notaria={notaria}>
      {children}
    </DashboardShell>
  )
}
